import Big from 'big.js';

import createHTMLRegex from '../../regexp/html.regexp';
import HTMLSanitizer from '../../sanitizers/html/html.sanitizer';
import BigUtils from '../../utils/big';
import DefaultLineBreakParser from '../default-line-break/default-line-break.parser';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParserState from '../models/parser-state.interface';
import Word from '../models/word.interface';
import extractStyles from './extract-styles.function';
import { FontStyles } from './font-styles.interface';
import HTMLTransformer from './html.transformer';

export default class HTMLParser extends DefaultLineBreakParser {
  /**
   * The last element will always be the original text content.
   * The first element will be either the original text content or an HTML element.
   * The parser currently is not expected to handle nested HTML tags - thus elements are only one - level deep.
   * Thus there are always only 0 - 2 elements in the array.
   */
  private iteratorQueue: Array<IterableIterator<RegExpMatchArray>>;
  private tag: {
    opening: string;
    name: string;
    remainingTextContentLength: number;
    lineHeight: Big;
  } | null;

  constructor(config: CreateTextParserConfig) {
    super(config);

    this.tokenExpression = new RegExp(
      `${createHTMLRegex().source}|${this.tokenExpression.source}`,
      this.tokenExpression.flags
    );
  }

  *generateParserStates(text: string): Generator<ParserState> {
    text = this.preprocessText(text);

    text = new HTMLTransformer({
      fontSize: this.config.fontSize,
    }).transform(text);

    text = new HTMLSanitizer().sanitize(text);

    this.iteratorQueue = [text.matchAll(this.tokenExpression)];

    const calculateWordWidth = (word) => this.calculator.calculate(word);

    let parserState = this.initializeParserState();

    yield parserState;

    let token: RegExpMatchArray;

    while ((token = this.getNext())) {
      const { groups } = token;

      /*
       * Not the best way of identifying the HTML tag, but named capture groups seem to break
       * with nested capture groups
       */
      const htmlExpression =
        token.filter((group) => Boolean(group)).length === 4;

      if (htmlExpression) {
        const opening = token.at(1);
        const tagContent = token.at(3);

        this.iteratorQueue.unshift(tagContent.matchAll(this.tokenExpression));

        let fontStyles: FontStyles;
        if ((fontStyles = extractStyles(opening))) {
          this.calculator.apply({
            size: fontStyles['font-size'],
            weight: fontStyles['font-weight'],
          });
        }

        this.tag = {
          opening,
          name: token.at(2),
          remainingTextContentLength: tagContent.length,
          lineHeight: BigUtils.max(
            this.bookLineHeight,
            Big(this.calculator.getCalculatedLineHeight())
          ),
        };

        parserState = {
          ...parserState,
          /*
           * This code will essentially break lines that are smaller than the default font size,
           * meaning it will overestimate and not fill out the page entirely.
           */
          lineHeight: BigUtils.max(
            this.bookLineHeight,
            Big(this.calculator.getCalculatedLineHeight())
          ),
        };

        parserState = this.parsePageOverflowFromLineHeightChange(parserState);

        parserState = this.openTag(parserState);

        continue;
      }

      const word = token.at(0);

      const wordDescription = this.getWordDescription(
        parserState,
        Boolean(groups['newline']),
        Boolean(groups['whitespace']),
        word,
        calculateWordWidth
      );

      /*
       * Old note: This is wrong. It is possible to transform only part of a word.
       * This considers the entire word.
       * I don't know what use case that would fulfill, however.
       *
       * New note: This actually does work, having observed the ping.txt. I forgot the
       * HTML regex creates its own context and cuts into words properly.
       * Who was it that said that good (in this case, decent) code can exhibit surprising behavior?
       */
      this.tag && (this.tag.remainingTextContentLength -= word.length);

      wordDescription.word.text += this.getClosingTag();

      const parseText = this.chooseWordParser(wordDescription);

      parserState = parseText(parserState, wordDescription.word);

      parserState = this.parsePageOverflow(parserState);

      parserState = this.postprocessParserState(parserState);

      if (this.shouldCloseTag()) {
        this.tag = null;

        this.calculator.reset();
      }

      yield parserState;
    }

    parserState = this.parseEnd(parserState);
    parserState = this.postprocessParserState(parserState);

    yield parserState;
  }

  /**
   * @returns the next token - either from the original text or a nested HTML tag - or 'null', if
   * there are no tokens left.
   */
  private getNext(): RegExpMatchArray | null {
    if (this.iteratorQueue.length === 0) {
      return null;
    }

    const iterator = this.iteratorQueue.at(0);
    const next = iterator.next();

    if (next.done) {
      this.iteratorQueue = this.iteratorQueue.slice(1);

      return this.getNext();
    } else {
      return next.value;
    }
  }

  protected parseNewline = function (
    state: ParserState,
    word: Word
  ): ParserState {
    return {
      ...state,
      textIndex: state.textIndex + word.text.length,
      // Cut the current text and begin on a newline.
      lines: state.lines.concat(state.lineText + word.text),
      pageHeight: state.pageHeight.add(state.lineHeight),
      lineHeight: this.tag?.lineHeight ?? this.bookLineHeight,
      lineWidth: Big(0),
      lineText: '',
    };
  };

  protected parseWhitespaceAtTextOverflow = function (
    state: ParserState,
    word: Word
  ): ParserState {
    return {
      ...state,
      textIndex: state.textIndex + word.text.length,
      // Cut the current text and begin on a newline.
      lines: state.lines.concat(state.lineText),
      pageHeight: state.pageHeight.add(state.lineHeight),
      lineHeight: this.tag?.lineHeight ?? this.bookLineHeight,
      lineWidth: Big(0),
      lineText: word.text,
    };
  };

  protected parseWordAtTextOverflow = function (
    state: ParserState,
    word: Word
  ): ParserState {
    return {
      ...state,
      textIndex: state.textIndex + word.text.length,
      // Cut the current text and begin on a newline.
      lines: state.lines.concat(state.lineText),
      pageHeight: state.pageHeight.add(state.lineHeight),
      lineHeight: this.tag?.lineHeight ?? this.bookLineHeight,
      lineWidth: word.width,
      lineText: word.text,
    };
  };

  protected parsePageOverflow = function (state: ParserState) {
    if (state.pageHeight.add(state.lineHeight).gte(this.config.pageHeight)) {
      return {
        ...state,
        pages: state.pages.concat(state.lines.join('')),
        changes: state.changes.concat({
          values: state.pageChanges,
        }),
        // Cut the current text and begin on a newline.
        lines: [],
        pageChanges: [],
        pageHeight: Big(0),
        lineText: this.getOpeningTag() + state.lineText.trim(),
      };
    } else {
      return state;
    }
  };

  private parsePageOverflowFromLineHeightChange(
    state: ParserState
  ): ParserState {
    if (state.pageHeight.add(state.lineHeight).gte(this.config.pageHeight)) {
      return {
        ...state,
        pages: state.pages.concat(state.lines.join('')),
        changes: state.changes.concat({
          values: state.pageChanges,
        }),
        // Cut the current text and begin on a newline.
        lines: [],
        pageChanges: [],
        pageHeight: Big(0),
        lineText: state.lineText.trim(),
      };
    } else {
      return state;
    }
  }

  private getOpeningTag(): string {
    return this.tag?.opening ?? '';
  }

  private openTag(state: ParserState): ParserState {
    return {
      ...state,
      lineText: state.lineText + this.getOpeningTag(),
    };
  }

  private shouldCloseTag(): boolean {
    return this.tag?.remainingTextContentLength <= 0 ?? false;
  }

  private getClosingTag(): string {
    if (this.shouldCloseTag()) {
      return `</${this.tag.name}>`;
    } else {
      return '';
    }
  }
}

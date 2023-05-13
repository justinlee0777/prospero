import Big from 'big.js';

import { dash, newline, punctuation, whitespace } from '../../glyphs.const';
import Processor from '../../processors/models/processor.interface';
import createHTMLRegex from '../../regexp/html.regexp';
import HTMLSanitizer from '../../sanitizers/html/html.sanitizer';
import BigUtils from '../../utils/big/index';
import WordWidthCalculator from '../../word-width.calculator';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParseWord from '../models/parse-word.interface';
import ParserState from '../models/parser-state.interface';
import Parser from '../models/parser.interface';
import Word from '../models/word.interface';
import parseEnd from '../word-parsers/end.parser';
import createNewlineAtPageBeginningParser from '../word-parsers/newline/newline-at-page-beginning.parser';
import parseWhitespaceAtPageBeginning from '../word-parsers/whitespace/whitespace-at-page-beginning.parser';
import parseWhitespaceInline from '../word-parsers/whitespace/whitespace-inline.parser';
import parseWord from '../word-parsers/word/word.parser';
import extractStyles from './extract-styles.function';
import { FontStyles } from './font-styles.interface';
import HTMLTransformer from './html.transformer';

export default class HTMLParser implements Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly.
   */
  public debug: {
    pageWidth: number;
  };

  private readonly tokenExpression: RegExp;

  private calculator: WordWidthCalculator;
  private processors: Array<Processor> = [];

  private bookLineHeight: Big;

  /*
   * The last element will always be the original text content.
   * The first element will be either the original text content or an HTML element.
   * The parser currently is not expected to handle nested HTML tags - thus elements are only one-level deep.
   * Thus there are always only 0 - 2 elements in the array.
   */
  private iteratorQueue: Array<IterableIterator<RegExpMatchArray>>;
  private tag: {
    opening: string;
    name: string;
    remainingTextContentLength: number;
    lineHeight: Big;
  } | null;

  constructor(private config: CreateTextParserConfig) {
    this.debug = {
      pageWidth: config.pageWidth,
    };

    const escapedPunctuation = [...punctuation]
      .map((glyph) => `\\${glyph}`)
      .join('');

    /**
     * <token> = <html> | <content>
     * <html> = <tag> <content> <tagend>
     * <content> = <punctuatedWord> | <whitespace> | <newline>
     * <punctuatedWord> = <punctuation> <word> <punctuation>
     * <punctuation> = "!" | "?" ... | ""
     * <word> = alphabetic sequence with at least one character
     * <whitespace> = " -"
     * <newline> = "\n"
     */
    const characterExpression = `[A-Za-z0-9${escapedPunctuation}]+`;
    const whitespaceExpression = `${whitespace}|${dash}`;
    const newlineExpression = newline;
    const expressions = [
      createHTMLRegex().source,
      `(?<word>${characterExpression})`,
      `(?<whitespace>${whitespaceExpression})`,
      `(?<newline>${newlineExpression})`,
    ];

    this.tokenExpression = new RegExp(expressions.join('|'), 'g');
  }

  setCalculator(calculator: WordWidthCalculator): void {
    this.calculator = calculator;

    this.bookLineHeight = Big(this.calculator.getCalculatedLineHeight());
  }

  setProcessors(processors: Array<Processor>): void {
    this.processors = processors;
  }

  *generateParserStates(text: string): Generator<ParserState> {
    text = this.processors.reduce(
      (newText, processor) => processor.preprocess?.(newText) ?? newText,
      text
    );

    text = new HTMLTransformer({
      fontSize: this.config.fontSize,
    }).transform(text);

    text = new HTMLSanitizer().sanitize(text);

    this.iteratorQueue = [text.matchAll(this.tokenExpression)];
    const calculateWordWidth = (word) => this.calculator.calculate(word);

    let parserState: ParserState = {
      pages: [],
      textIndex: 0,
      changes: [],
      bookLineHeight: Big(0),

      lines: [],
      pageHeight: Big(0),
      pageChanges: [],

      lineWidth: Big(0),
      lineHeight: this.bookLineHeight,
      lineText: '',
    };

    parserState = this.postprocessParserState(parserState);

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

      const newlineExpression = Boolean(groups['newline']);
      const whitespaceExpression = Boolean(groups['whitespace']);

      const wordWidth = Big(calculateWordWidth(word)).round(2, 0);

      const pageBeginning =
        parserState.pageHeight.eq(0) && parserState.lineWidth.eq(0);
      const wordOverflows = parserState.lineWidth
        .plus(wordWidth)
        .gte(this.config.pageWidth);

      /*
       * This is wrong. It is possible to only transform part of a word.
       * This considers the entire word.
       * I don't know what use case that would fulfill, however.
       */
      this.tag && (this.tag.remainingTextContentLength -= word.length);

      let parseText: ParseWord;

      if (newlineExpression) {
        if (pageBeginning) {
          parseText = this.parseNewlineAtPageBeginning;
        } else {
          parseText = this.parseNewline.bind(this);
        }
      } else if (whitespaceExpression) {
        if (wordOverflows) {
          parseText = this.parseWhitespaceAtTextOverflow.bind(this);
        } else if (pageBeginning) {
          parseText = this.parseWhitespaceAtPageBeginning;
        } else {
          parseText = this.parseWhitespaceInline;
        }
      } else {
        if (wordOverflows) {
          parseText = this.parseWordAtTextOverflow.bind(this);
        } else {
          parseText = this.parseWord;
        }
      }

      const wordState: Word = {
        text: word + this.getClosingTag(),
        width: wordWidth,
      };

      parserState = parseText(parserState, wordState);
      parserState = this.parsePageOverflow(parserState);

      parserState = this.postprocessParserState(parserState);

      if (this.shouldCloseTag()) {
        this.tag = null;

        this.calculator.reset();
      }

      yield parserState;
    }

    parserState = this.parseEnd(parserState, { text: '', width: Big(0) });

    yield parserState;
  }

  *generatePages(text: string): Generator<string> {
    const parserStates = this.generateParserStates(text);

    let parserState: ParserState;

    for (const newParserState of parserStates) {
      if (
        parserState &&
        newParserState.pages.length > parserState.pages.length
      ) {
        yield newParserState.pages.at(-1);
      }

      parserState = newParserState;
    }
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

  private parseNewlineAtPageBeginning: ParseWord =
    createNewlineAtPageBeginningParser;
  private parseNewline(state: ParserState, word: Word): ParserState {
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
  }

  private parseWhitespaceAtPageBeginning: ParseWord =
    parseWhitespaceAtPageBeginning;
  private parseWhitespaceAtTextOverflow(
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
  }
  private parseWhitespaceInline: ParseWord = parseWhitespaceInline;

  private parseWordAtTextOverflow(state: ParserState, word: Word): ParserState {
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
  }
  private parseWord: ParseWord = parseWord;

  private parseEnd: ParseWord = parseEnd;

  private parsePageOverflow(state: ParserState): ParserState {
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
  }

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

  private postprocessParserState(parserState: ParserState): ParserState {
    return this.processors.reduce(
      (newParserState, processor) =>
        processor.process?.(newParserState) ?? newParserState,
      parserState
    );
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

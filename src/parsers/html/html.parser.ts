import Big from 'big.js';

import { dash, newline, punctuation, whitespace } from '../../glyphs.const';
import Processor from '../../processors/models/processor.interface';
import HTMLRegex from '../../regexp/html.regexp';
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
      HTMLRegex.source,
      `(?<word>${characterExpression})`,
      `(?<whitespace>${whitespaceExpression})`,
      `(?<newline>${newlineExpression})`,
    ];

    this.tokenExpression = new RegExp(expressions.join('|'), 'g');
  }

  setCalculator(calculator: WordWidthCalculator): void {
    this.calculator = calculator;
  }

  setProcessors(processors: Array<Processor>): void {
    this.processors = processors;
  }

  *generateParserStates(text: string): Generator<ParserState> {
    /*
        text = this.processors.reduce(
            (newText, processor) => processor.preprocess?.(newText) ?? newText,
            text
        );
        */

    this.iteratorQueue = [text.matchAll(this.tokenExpression)];
    const calculateWordWidth = (word) => this.calculator.calculate(word);

    const bookLineHeight = Big(this.config.lineHeight);

    let parserState: ParserState = {
      pages: [],
      textIndex: 0,
      changes: [],
      bookLineHeight: Big(0),

      lines: [],
      pageHeight: bookLineHeight,
      pageChanges: [],

      lineWidth: Big(0),
      lineHeight: bookLineHeight,
      lineText: '',
    };

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
        const tagContent = token.at(3);

        this.iteratorQueue.unshift(tagContent.matchAll(this.tokenExpression));
        this.tag = {
          opening: token.at(1),
          name: token.at(2),
          remainingTextContentLength: tagContent.length,
        };

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

      if (this.shouldCloseTag()) {
        this.tag = null;
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
    createNewlineAtPageBeginningParser(this.config);
  private parseNewline(state: ParserState, word: Word): ParserState {
    if (state.pageHeight.add(state.lineHeight).gte(this.config.pageHeight)) {
      return {
        ...state,
        pages: state.pages.concat(
          state.lines.join('') +
            state.lineText +
            word.text +
            this.getClosingTag()
        ),
        changes: state.changes.concat({
          values: state.pageChanges,
        }),
        textIndex: state.textIndex + word.text.length,
        // Cut the current text and begin on a newline.
        lines: [],
        pageChanges: [],
        pageHeight: state.lineHeight,
        lineWidth: Big(0),
        lineText: this.getOpeningTag() + '',
      };
    } else {
      return {
        ...state,
        textIndex: state.textIndex + word.text.length,
        // Cut the current text and begin on a newline.
        lines: state.lines.concat(state.lineText + word.text),
        pageHeight: state.pageHeight.add(state.lineHeight),
        lineWidth: Big(0),
        lineText: '',
      };
    }
  }

  private parseWhitespaceAtPageBeginning: ParseWord =
    parseWhitespaceAtPageBeginning;
  private parseWhitespaceAtTextOverflow(
    state: ParserState,
    word: Word
  ): ParserState {
    if (state.pageHeight.add(state.lineHeight).gte(this.config.pageHeight)) {
      return {
        ...state,
        pages: state.pages.concat(
          state.lines.join('') +
            state.lineText +
            word.text +
            this.getClosingTag()
        ),
        changes: state.changes.concat({
          values: state.pageChanges,
        }),
        textIndex: state.textIndex + word.text.length,
        // Cut the current text and begin on a newline.
        lines: [],
        pageChanges: [],
        pageHeight: state.lineHeight,
        lineWidth: Big(0),
        lineText: this.getOpeningTag() + '',
      };
    } else {
      return {
        ...state,
        textIndex: state.textIndex + word.text.length,
        // Cut the current text and begin on a newline.
        lines: state.lines.concat(state.lineText),
        pageHeight: state.pageHeight.add(state.lineHeight),
        lineWidth: Big(0),
        lineText: word.text,
      };
    }
  }
  private parseWhitespaceInline: ParseWord = parseWhitespaceInline;

  private parseWordAtTextOverflow(state: ParserState, word: Word): ParserState {
    if (state.pageHeight.add(state.lineHeight).gte(this.config.pageHeight)) {
      return {
        ...state,
        pages: state.pages.concat(
          state.lines.join('') + state.lineText + this.getClosingTag()
        ),
        changes: state.changes.concat({
          values: state.pageChanges,
        }),
        textIndex: state.textIndex + word.text.length,
        // Cut the current text and begin on a newline.
        lines: [],
        pageChanges: [],
        pageHeight: state.lineHeight,
        lineWidth: word.width,
        lineText: this.getOpeningTag() + word.text,
      };
    } else {
      return {
        ...state,
        textIndex: state.textIndex + word.text.length,
        // Cut the current text and begin on a newline.
        lines: state.lines.concat(state.lineText),
        pageHeight: state.pageHeight.add(state.lineHeight),
        lineWidth: word.width,
        lineText: word.text,
      };
    }
  }
  private parseWord: ParseWord = parseWord;

  private parseEnd: ParseWord = parseEnd;

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

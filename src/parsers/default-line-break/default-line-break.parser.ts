import Big from 'big.js';

import { dash, newline, punctuation, whitespace } from '../../glyphs.const';
import Processor from '../../processors/models/processor.interface';
import WordWidthCalculator from '../../word-width.calculator';
import CalculateWordWidth from '../builders/calculate-word-width.interface';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParseWord from '../models/parse-word.interface';
import ParserState from '../models/parser-state.interface';
import Parser from '../models/parser.interface';
import Word from '../models/word.interface';
import parseEnd from '../word-parsers/end.parser';
import createNewlineAtPageBeginningParser from '../word-parsers/newline/newline-at-page-beginning.parser';
import createNewlineParser from '../word-parsers/newline/newline.parser';
import pageOverflowParser from '../word-parsers/page-overflow.parser';
import createWhitespaceAtTextOverflowParser from '../word-parsers/whitespace/whitespace-at-text-overflow.parser';
import parseWhitespaceInline from '../word-parsers/whitespace/whitespace-inline.parser';
import createWordAtTextOverflowParser from '../word-parsers/word/word-at-text-overflow.parser';
import parseWord from '../word-parsers/word/word.parser';

/**
 * Describes the effect a word has on a page.
 */
interface WordDescription {
  isNewline: boolean;
  isWhitespace: boolean;
  isBeginningOfPage: boolean;
  causesWordOverflow: boolean;
  word: Word;
}

export default class DefaultLineBreakParser implements Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly. Or don't, I don't really care beyond documentation.
   */
  public debug: {
    pageWidth: number;
  };

  protected tokenExpression: RegExp;

  protected parseNewlineAtPageBeginning = createNewlineAtPageBeginningParser;
  protected parseNewline = createNewlineParser;

  protected parseWhitespaceAtPageBeginning = createNewlineAtPageBeginningParser;
  protected parseWhitespaceAtTextOverflow =
    createWhitespaceAtTextOverflowParser;
  protected parseWhitespaceInline = parseWhitespaceInline;

  protected parseWordAtTextOverflow = createWordAtTextOverflowParser;
  protected parseWord = parseWord;

  protected parsePageOverflow: (parserState: ParserState) => ParserState;
  protected parseEnd = parseEnd;

  protected calculator: WordWidthCalculator;
  protected processors: Array<Processor> = [];

  /**
   * Line height for the whole book, given the font size configured.
   */
  protected bookLineHeight: Big;

  constructor(protected config: CreateTextParserConfig) {
    this.debug = {
      pageWidth: config.pageWidth,
    };

    const escapedPunctuation = [...punctuation]
      .map((glyph) => `\\${glyph}`)
      .join('');

    /**
     * <token> = <punctuatedWord> | <whitespace> | <newline>
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
      `(?<word>${characterExpression})`,
      `(?<whitespace>${whitespaceExpression})`,
      `(?<newline>${newlineExpression})`,
    ];

    this.tokenExpression = new RegExp(expressions.join('|'), 'g');

    this.parsePageOverflow = pageOverflowParser(this.config);
  }

  setCalculator(calculator: WordWidthCalculator): void {
    this.calculator = calculator;

    this.bookLineHeight = Big(this.calculator.getCalculatedLineHeight());
  }

  setProcessors(processors: Processor[]): void {
    this.processors = processors;
  }

  *generateParserStates(text: string): Generator<ParserState> {
    text = this.preprocessText(text);

    const tokens = text.matchAll(this.tokenExpression);
    const calculateWordWidth = (word) => this.calculator.calculate(word);

    let parserState = this.initializeParserState();

    yield parserState;

    for (const token of tokens) {
      const { 0: word, groups } = token;

      const wordDescription = this.getWordDescription(
        parserState,
        Boolean(groups['newline']),
        Boolean(groups['whitespace']),
        word,
        calculateWordWidth
      );

      const parseText = this.chooseWordParser(wordDescription);

      parserState = parseText(parserState, wordDescription.word);

      parserState = this.parsePageOverflow(parserState);

      parserState = this.postprocessParserState(parserState);
      yield parserState;
    }

    parserState = this.parseEnd(parserState);
    parserState = this.postprocessParserState(parserState);

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

  protected preprocessText(text: string): string {
    return this.processors.reduce(
      (newText, processor) => processor.preprocess?.(newText) ?? newText,
      text
    );
  }

  protected postprocessParserState(parserState: ParserState): ParserState {
    return this.processors.reduce(
      (newParserState, processor) =>
        processor.process?.(newParserState) ?? newParserState,
      parserState
    );
  }

  protected initializeParserState(): ParserState {
    const parserState: ParserState = {
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

    return this.postprocessParserState(parserState);
  }

  protected getWordDescription(
    parserState: ParserState,
    isNewline: boolean,
    isWhitespace: boolean,
    text: string,
    calculateWordWidth: CalculateWordWidth
  ): WordDescription {
    const wordWidth = Big(calculateWordWidth(text)).round(2, 0);

    return {
      isNewline,
      isWhitespace,
      isBeginningOfPage:
        parserState.pageHeight.eq(0) && parserState.lineWidth.eq(0),
      causesWordOverflow: parserState.lineWidth
        .plus(wordWidth)
        .gte(this.config.pageWidth),
      word: {
        text,
        width: wordWidth,
      },
    };
  }

  protected chooseWordParser({
    isNewline,
    isWhitespace,
    isBeginningOfPage,
    causesWordOverflow,
  }: WordDescription): ParseWord {
    let parseWord: ParseWord;

    if (isNewline) {
      if (isBeginningOfPage) {
        parseWord = this.parseNewlineAtPageBeginning;
      } else {
        parseWord = this.parseNewline;
      }
    } else if (isWhitespace) {
      if (causesWordOverflow) {
        parseWord = this.parseWhitespaceAtTextOverflow;
      } else if (isBeginningOfPage) {
        parseWord = this.parseWhitespaceAtPageBeginning;
      } else {
        parseWord = this.parseWhitespaceInline;
      }
    } else {
      if (causesWordOverflow) {
        parseWord = this.parseWordAtTextOverflow;
      } else {
        parseWord = this.parseWord;
      }
    }

    return parseWord.bind(this);
  }
}

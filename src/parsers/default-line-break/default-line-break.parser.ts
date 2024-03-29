import Big from 'big.js';

import { dash, newline, whitespace } from '../../glyphs.const';
import Transformer from '../../transformers/models/transformer.interface';
import IWordWidthCalculator from '../../word-width-calculator.interface';
import CalculateWordWidth from '../builders/calculate-word-width.interface';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParseWord from '../models/parse-word.interface';
import ParserState from '../models/parser-state.interface';
import Parser from '../models/parser.interface';
import Word from '../models/word.interface';
import parseEnd from '../word-parsers/end.parser';
import createNewlineParser from '../word-parsers/newline/newline.parser';
import pageOverflowParser from '../word-parsers/page-overflow.parser';
import createWhitespaceAtTextOverflowParser from '../word-parsers/whitespace/whitespace-at-text-overflow.parser';
import parseWhitespaceInline from '../word-parsers/whitespace/whitespace-inline.parser';
import createWordAtTextOverflowParser from '../word-parsers/word/word-at-text-overflow.parser';
import parseWord from '../word-parsers/word/word.parser';
import CreateLineBreakParserConfig from './create-line-break-parser-config.interface';

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
   * This is used to debug the parser. Beware if you use this directly.
   */
  public debug: CreateTextParserConfig;

  protected tokenExpression: RegExp;

  protected parseNewline = createNewlineParser;

  protected parseWhitespaceAtTextOverflow =
    createWhitespaceAtTextOverflowParser;
  protected parseWhitespaceInline = parseWhitespaceInline;

  protected parseWordAtTextOverflow = createWordAtTextOverflowParser;
  protected parseWord = parseWord;

  protected parsePageOverflow: (parserState: ParserState) => ParserState;

  protected calculator: IWordWidthCalculator;
  protected transformers: Array<Transformer> = [];

  protected pageWidth: number;

  /**
   * Line height for the whole book, given the font size configured.
   */
  protected bookLineHeight: Big;

  constructor(protected config: CreateLineBreakParserConfig) {
    this.debug = config;

    this.pageWidth = config.pageWidth;

    /**
     * <token> = <punctuatedWord> | <whitespace> | <newline>
     * <punctuatedWord> = <punctuation> <word> <punctuation>
     * <punctuation> = "!" | "?" ... | ""
     * <word> = alphabetic sequence with at least one character
     * <whitespace> = " -"
     * <newline> = "\n"
     */
    const whitespaceExpression = `${whitespace}|${dash}`;
    const newlineExpression = newline;
    /**
     * 1. As phrases with dashes can be cut by the dash, such that the
     * word preceding contains the dash, we look for "{word without dash}{dash, optionally}"
     */
    const characterExpression = `[^${whitespace}\\${dash}${newline}]+${dash}?`;
    let expressions = [
      `(?<word>${characterExpression})`,
      `(?<whitespace>${whitespaceExpression})`,
    ];

    if (!config.ignoreNewline) {
      expressions = expressions.concat(`(?<newline>${newlineExpression})`);
    }

    this.tokenExpression = new RegExp(expressions.join('|'), 'g');

    this.parsePageOverflow = pageOverflowParser(this.config);
  }

  setCalculator(calculator: IWordWidthCalculator): void {
    this.calculator = calculator;

    this.bookLineHeight = Big(this.calculator.getCalculatedLineHeight());
  }

  setTransformers(transformers: Array<Transformer>): void {
    this.transformers = transformers;
  }

  *generateParserStates(
    text: string,
    parserState?: ParserState,
    end = parseEnd
  ): Generator<ParserState> {
    text = this.transformText(text);

    const tokens = text.matchAll(this.tokenExpression);
    const calculateWordWidth = (word) => this.calculator.calculate(word);

    if (!parserState) {
      parserState = this.initializeParserState();

      yield parserState;
    }

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

      yield parserState;
    }

    parserState = end?.(parserState) ?? parserState;

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

  protected transformText(text: string): string {
    return this.transformers.reduce((newText, transformer) => {
      transformer.forHTML = false;
      return transformer.transform(newText);
    }, text);
  }

  protected initializeParserState(): ParserState {
    return {
      pages: [],
      textIndex: 0,

      lines: [],
      pageHeight: Big(0),

      lineWidth: Big(0),
      lineHeight: this.bookLineHeight,
      lineText: '',
    };
  }

  protected getWordDescription(
    parserState: ParserState,
    isNewline: boolean,
    isWhitespace: boolean,
    text: string,
    calculateWordWidth: CalculateWordWidth
  ): WordDescription {
    const wordWidth = Big(calculateWordWidth(text)).round(2, 3);

    return {
      isNewline,
      isWhitespace,
      isBeginningOfPage:
        parserState.pageHeight.eq(0) && parserState.lineWidth.eq(0),
      causesWordOverflow: parserState.lineWidth
        .plus(wordWidth)
        .gte(this.pageWidth),
      word: {
        text,
        width: wordWidth,
      },
    };
  }

  protected chooseWordParser({
    isNewline,
    isWhitespace,
    causesWordOverflow,
  }: WordDescription): ParseWord {
    let parseWord: ParseWord;

    if (isNewline) {
      parseWord = this.parseNewline;
    } else if (isWhitespace) {
      if (causesWordOverflow) {
        parseWord = this.parseWhitespaceAtTextOverflow;
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

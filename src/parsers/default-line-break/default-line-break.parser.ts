import Big from 'big.js';

import { dash, newline, punctuation, whitespace } from '../../glyphs.const';
import Processor from '../../processors/models/processor.interface';
import WordWidthCalculator from '../../word-width.calculator';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParseWord from '../models/parse-word.interface';
import ParserState from '../models/parser-state.interface';
import Parser from '../models/parser.interface';
import Word from '../models/word.interface';
import parseEnd from '../word-parsers/end.parser';
import createNewlineAtPageBeginningParser from '../word-parsers/newline/newline-at-page-beginning.parser';
import createNewlineParser from '../word-parsers/newline/newline.parser';
import parseWhitespaceAtPageBeginning from '../word-parsers/whitespace/whitespace-at-page-beginning.parser';
import createWhitespaceAtTextOverflowParser from '../word-parsers/whitespace/whitespace-at-text-overflow.parser';
import parseWhitespaceInline from '../word-parsers/whitespace/whitespace-inline.parser';
import createWordAtTextOverflowParser from '../word-parsers/word/word-at-text-overflow.parser';
import parseWord from '../word-parsers/word/word.parser';

export default class DefaultLineBreakParser implements Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly. Or don't, I don't really care beyond documentation.
   */
  public debug: {
    pageWidth: number;
  };

  private readonly tokenExpression: RegExp;

  private readonly parseNewlineAtPageBeginning: ParseWord;
  private readonly parseNewline: ParseWord;

  private readonly parseWhitespaceAtPageBeginning: ParseWord;
  private readonly parseWhitespaceAtTextOverflow: ParseWord;
  private readonly parseWhitespaceInline: ParseWord;

  private readonly parseWordAtTextOverflow: ParseWord;
  private readonly parseWord: ParseWord;

  private calculator: WordWidthCalculator;
  private processors: Array<Processor> = [];

  constructor(private config: CreateTextParserConfig) {
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

    this.parseNewlineAtPageBeginning =
      createNewlineAtPageBeginningParser(config);
    this.parseNewline = createNewlineParser(config);

    this.parseWhitespaceAtPageBeginning = parseWhitespaceAtPageBeginning;
    this.parseWhitespaceAtTextOverflow =
      createWhitespaceAtTextOverflowParser(config);
    this.parseWhitespaceInline = parseWhitespaceInline;

    this.parseWordAtTextOverflow = createWordAtTextOverflowParser(config);
    this.parseWord = parseWord;
  }

  setCalculator(calculator: WordWidthCalculator): void {
    this.calculator = calculator;
  }

  setProcessors(processors: Processor[]): void {
    this.processors = processors;
  }

  *generateParserStates(text: string): Generator<ParserState> {
    text = this.processors.reduce(
      (newText, processor) => processor.preprocess?.(newText) ?? newText,
      text
    );

    const tokens = text.matchAll(this.tokenExpression);
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

    parserState = this.postprocessParserState(parserState);

    yield parserState;

    for (const token of tokens) {
      const { 0: word, groups } = token;

      const newlineExpression = Boolean(groups['newline']);
      const whitespaceExpression = Boolean(groups['whitespace']);

      const wordWidth = Big(calculateWordWidth(word)).round(2, 0);

      const pageBeginning =
        parserState.pageHeight.eq(0) && parserState.lineWidth.eq(0);
      const wordOverflows = parserState.lineWidth
        .plus(wordWidth)
        .gte(this.config.pageWidth);

      let parseText: ParseWord;

      if (newlineExpression) {
        if (pageBeginning) {
          parseText = this.parseNewlineAtPageBeginning;
        } else {
          parseText = this.parseNewline;
        }
      } else if (whitespaceExpression) {
        if (wordOverflows) {
          parseText = this.parseWhitespaceAtTextOverflow;
        } else if (pageBeginning) {
          parseText = this.parseWhitespaceAtPageBeginning;
        } else {
          parseText = this.parseWhitespaceInline;
        }
      } else {
        if (wordOverflows) {
          parseText = this.parseWordAtTextOverflow;
        } else {
          parseText = this.parseWord;
        }
      }

      const wordState: Word = {
        text: word,
        width: wordWidth,
      };

      parserState = parseText(parserState, wordState);
      parserState = this.postprocessParserState(parserState);
      yield parserState;
    }

    parserState = parseEnd(parserState, { text: '', width: Big(0) });
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

  private postprocessParserState(parserState: ParserState): ParserState {
    return this.processors.reduce(
      (newParserState, processor) =>
        processor.process?.(newParserState) ?? newParserState,
      parserState
    );
  }
}

import Big from 'big.js';

import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParseWord from '../models/parse-word.interface';
import ParserState from '../models/parser-state.interface';
import createNewlineAtPageBeginningParser from './newline/newline-at-page-beginning.parser';
import createNewlineParser from './newline/newline.parser';
import parseWhitespaceAtPageBeginning from './whitespace/whitespace-at-page-beginning.parser';
import createWhitespaceAtTextOverflowParser from './whitespace/whitespace-at-text-overflow.parser';
import parseWhitespaceInline from './whitespace/whitespace-inline.parser';
import createWordAtTextOverflowParser from './word/word-at-text-overflow.parser';
import parseWord from './word/word.parser';
import { dash, newline, punctuation, whitespace } from '../../glyphs.const';
import Word from '../models/word.interface';
import CalculateWordWidth from '../builders/calculate-word-width.interface';

export class DefaultLinkBreakParser {
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

  private calculateWordWidth: CalculateWordWidth;

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

  setCalculateWordWidth(calculateWordWidth: CalculateWordWidth): void {
    this.calculateWordWidth = calculateWordWidth;
  }

  *generateParserStates(text: string): Generator<ParserState> {
    const tokens = text.matchAll(this.tokenExpression);
    const calculateWordWidth = this.calculateWordWidth;

    let parserState: ParserState = {
      pages: [],

      lines: [],

      lineWidth: Big(this.config.textIndent.width),
      line: 0,
      lineText: this.config.textIndent.text,
    };

    for (const token of tokens) {
      const { 0: word, groups } = token;

      const newlineExpression = Boolean(groups['newline']);
      const whitespaceExpression = Boolean(groups['whitespace']);

      const wordWidth = Big(calculateWordWidth(word)).round(2, 0);

      const pageBeginning =
        parserState.line === 0 && parserState.lineWidth.eq(0);
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

      yield parserState;
    }
  }

  *generatePages(text: string): Generator<string> {
    const parserStates = this.generateParserStates(text);

    let parserState: ParserState;

    for (const newParserState of parserStates) {
      if (
        parserState &&
        newParserState.pages.length > parserState.pages.length
      ) {
        yield newParserState.pages[newParserState.pages.length - 1];
      }

      parserState = newParserState;
    }

    if (parserState.lines.length > 0) {
      yield [...parserState.lines, parserState.lineText].join('');
    }
  }
}

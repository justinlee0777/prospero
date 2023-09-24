import Big from 'big.js';

import { dash, newline, whitespace } from '../../glyphs.const';
import Transformer from '../../transformers/models/transformer.interface';
import IWordWidthCalculator from '../../word-width-calculator.interface';
import ChangeParserState from '../models/change-parser-state.interface';
import ParserGenerator from '../models/parser-generator.interface';
import ParserState from '../models/parser.state';
import Word from '../models/word.interface';
import ParseNewline from '../word-parsers/newline/newline.parser';
import ParsePageOverflow from '../word-parsers/page-overflow.parser';
import ParseWhitespaceAtTextOverflow from '../word-parsers/whitespace/whitespace-at-text-overflow.parser';
import ParseWhitespaceInline from '../word-parsers/whitespace/whitespace-inline.parser';
import ParseWordAtTextOverflow from '../word-parsers/word/word-at-text-overflow.parser';
import ParseWord from '../word-parsers/word/word.parser';
import CreateLineBreakParserConfig from './create-line-break-parser-config.interface';

export default class DefaultLineBreakParserGenerator
  implements ParserGenerator
{
  done: boolean;
  value: ParserState;

  parsePageOverflow: ChangeParserState<void>;

  private readonly tokens: IterableIterator<RegExpMatchArray>;

  private readonly parseNewline: ChangeParserState<void>;

  private readonly parseWhitespaceAtTextOverflow: ChangeParserState<Word>;
  private readonly parseWhitespaceInline: ChangeParserState<Word>;

  private readonly parseWordAtTextOverflow: ChangeParserState<Word>;
  private readonly parseWord: ChangeParserState<Word>;

  constructor(
    text: string,
    private config: CreateLineBreakParserConfig,
    private wordWidthCalculator: IWordWidthCalculator,
    private transformers: Array<Transformer> = [],
    initialState?: ParserState
  ) {
    // Initialize public generator-specific variables.
    this.done = false;

    if (initialState) {
      this.value = initialState;
    } else {
      this.value = new ParserState({
        pages: [],
        textIndex: 0,

        lines: [],
        pageHeight: Big(0),

        lineWidth: Big(0),
        lineHeight: Big(config.lineHeight),
        lineText: '',
      });
    }

    // Initialize changes in ParserState.
    this.parseNewline = new ParseNewline();

    this.parseWhitespaceAtTextOverflow = new ParseWhitespaceAtTextOverflow();
    this.parseWhitespaceInline = new ParseWhitespaceInline();

    this.parseWordAtTextOverflow = new ParseWordAtTextOverflow();
    this.parseWord = new ParseWord();

    this.parsePageOverflow = new ParsePageOverflow();

    // Break the text down into text tokens for future analysis.
    text = this.transformText(text);

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

    const tokenExpression = new RegExp(expressions.join('|'), 'g');

    this.tokens = text.matchAll(tokenExpression);
  }

  next(changedParserState?: ParserState): ParserState {
    const match = this.tokens.next();

    let { value } = this;

    if (changedParserState) {
      value = changedParserState;
    }

    if (match.done) {
      this.done = true;
      return this.value;
    } else {
      const token: RegExpMatchArray = match.value;

      const { 0: text, groups } = token;

      const wordWidth = Big(this.wordWidthCalculator.calculate(text)).round(
        2,
        3
      );

      const isNewline = Boolean(groups['newline']);
      const isWhitespace = Boolean(groups['whitespace']);
      const causesWordOverflow = value.initial.lineWidth
        .plus(wordWidth)
        .gte(this.config.pageWidth);

      const word: Word = { text, width: wordWidth };

      if (isNewline) {
        value = this.parseNewline.parse(value);
      } else if (isWhitespace) {
        if (causesWordOverflow) {
          value = this.parseWhitespaceAtTextOverflow.parse(value, word);
        } else {
          value = this.parseWhitespaceInline.parse(value, word);
        }
      } else {
        if (causesWordOverflow) {
          value = this.parseWordAtTextOverflow.parse(value, word);
        } else {
          value = this.parseWord.parse(value, word);
        }
      }

      const { pageHeight, lineHeight } = value.initial;
      if (pageHeight.add(lineHeight).gte(this.config.pageHeight)) {
        value = this.parsePageOverflow.parse(value);
      }

      return (this.value = value);
    }
  }

  private transformText(text: string): string {
    return this.transformers.reduce((newText, transformer) => {
      transformer.forHTML = false;
      return transformer.transform(newText);
    }, text);
  }
}

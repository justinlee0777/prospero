import Big from 'big.js';

import Transformer from '../../transformers/models/transformer.interface';
import IWordWidthCalculator from '../../word-width-calculator.interface';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParserGenerator from '../models/parser-generator.interface';
import Parser from '../models/parser.interface';
import ParserState from '../models/parser.state';
import ParseEnd from '../word-parsers/end.parser';
import CreateLineBreakParserConfig from './create-line-break-parser-config.interface';
import DefaultLineBreakParserGenerator from './default-line-break.parser.generator';

export default class DefaultLineBreakParser implements Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly.
   */
  public debug: CreateTextParserConfig;

  protected calculator: IWordWidthCalculator;
  protected transformers: Array<Transformer> = [];

  /**
   * Line height for the whole book, given the font size configured.
   */
  protected bookLineHeight: Big;

  constructor(protected config: CreateLineBreakParserConfig) {
    this.debug = config;
  }

  setCalculator(calculator: IWordWidthCalculator): void {
    this.calculator = calculator;

    this.bookLineHeight = Big(this.calculator.getCalculatedLineHeight());
  }

  setTransformers(transformers: Array<Transformer>): void {
    this.transformers = transformers;
  }

  createGenerator(text: string, initial?: ParserState): ParserGenerator {
    return new DefaultLineBreakParserGenerator(
      text,
      this.config,
      this.calculator,
      this.transformers,
      initial
    );
  }

  *generateParserStates(
    text: string,
    parserState?: ParserState,
    end = new ParseEnd()
  ): Generator<ParserState> {
    const generator = this.createGenerator(text, parserState);

    while (!generator.done) {
      yield (parserState = generator.next());
    }

    if (end) {
      yield end.parse(parserState);
    }
  }

  *generatePages(text: string): Generator<string> {
    const parserStates = this.generateParserStates(text);

    let parserState: ParserState;

    for (const newParserState of parserStates) {
      if (
        parserState &&
        newParserState.initial.pages.length > parserState.initial.pages.length
      ) {
        yield newParserState.initial.pages.at(-1);
      }

      parserState = newParserState;
    }
  }
}

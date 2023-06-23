import Processor from '../../transformers/models/transformer.interface';
import IWordWidthCalculator from '../../word-width-calculator.interface';
import ParserState from './parser-state.interface';

export default interface Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly. Or don't, I don't really care.
   */
  debug: {
    pageWidth: number;
  };

  setCalculator(calculator: IWordWidthCalculator): void;

  setProcessors(processors: Array<Processor>): void;

  generateParserStates(text: string): Generator<ParserState>;

  generatePages(text: string): Generator<string>;
}

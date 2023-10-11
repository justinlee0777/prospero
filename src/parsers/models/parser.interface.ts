import Transformer from '../../transformers/models/transformer.interface';
import IWordWidthCalculator from '../../word-width-calculator.interface';
import ChangeParserState from './change-parser-state.interface';
import ParserGenerator from './parser-generator.interface';
import ParserState from './parser.state';

export default interface Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly. Or don't, I don't really care.
   */
  debug: {
    pageWidth: number;
  };

  setCalculator(calculator: IWordWidthCalculator): void;

  setTransformers(transformers: Array<Transformer>): void;

  /**
   * Creates a self-contained generator that parses each token of the text atomically.
   * @param text to parse.
   */
  createGenerator(text: string, initial?: ParserState): ParserGenerator;

  /**
   * @param text to parse.
   * @param parserState to work on top of. This is the connective tissue between different parsers.
   * @param end handler for the parser. For example, the end of a parser may be to finish the entire book or section.
   *   If undefined, nothing should be done, implying that another parser will pick up subsequent work.
   */
  generateParserStates(
    text: string,
    parserState?: ParserState,
    end?: ChangeParserState<void>
  ): Generator<ParserState>;

  generatePages(text: string): Generator<string>;
}

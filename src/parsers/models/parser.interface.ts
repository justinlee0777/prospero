import Transformer from '../../transformers/models/transformer.interface';
import Parse from './parse.interface';
import ParserState from './parser-state.interface';

export default interface Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly. Or don't, I don't really care.
   */
  debug: {
    pageWidth: number;
  };

  setTransformers(transformers: Array<Transformer>): void;

  /**
   * @param text to parse.
   * @param parserState to work on top of. This is the connective tissue between different parsers.
   * @param end handler for the parser. For example, the end of a parser may be to finish the entire book or section.
   *   If undefined, nothing should be done, implying that another parser will pick up subsequent work.
   */
  generateParserStates(
    text: string,
    parserState?: ParserState,
    end?: Parse
  ): Generator<string>;

  generatePages(text: string): Generator<string>;
}

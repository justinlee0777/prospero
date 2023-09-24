import ChangeParserState from './change-parser-state.interface';
import ParserState from './parser.state';

export default interface ParserGenerator {
  value: ParserState;
  done: boolean;

  /**
   * Continues to the next ParserState.
   * @param changedParserState from the parent or caller of the code.
   */
  next(changedParserState?: ParserState): ParserState;

  /**
   * Overridden parsers that are not necessarily related to the content the parser is observing.
   * This would not affect the parser's decision-making.
   */

  parsePageOverflow: ChangeParserState<void>;
}

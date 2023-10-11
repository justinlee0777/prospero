import Big from 'big.js';

import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser.state';

/**
 * Change the line height of a parser state.
 */
export default class ChangeLineHeight implements ChangeParserState<Big> {
  parse(state: ParserState, lineHeight: Big): ParserState {
    return state.change({
      lineHeight,
    });
  }
}

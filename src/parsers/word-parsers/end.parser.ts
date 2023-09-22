import Big from 'big.js';

import ChangeParserState from '../models/change-parser-state.interface';
import ParserState from '../models/parser-state.interface';

export default class ParseEnd implements ChangeParserState<void> {
  parse(state: ParserState): ParserState {
    return {
      ...state,
      pages: state.pages.concat(state.lines.join('') + state.lineText),
      // Cut the current text and begin on a newline.
      lines: [],
      lineWidth: Big(0),
      lineText: '',
    };
  }
}

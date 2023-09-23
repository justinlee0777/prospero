import Big from 'big.js';

import ChangeParserState from '../models/change-parser-state.interface';
import ParserState from '../models/parser.state';

export default class ParseEnd implements ChangeParserState<void> {
  parse(state: ParserState): ParserState {
    const { pages, lines, lineText } = state.initial;

    return state.change({
      pages: pages.concat(lines.join('') + lineText),
      // Cut the current text and begin on a newline.
      lines: [],
      lineWidth: Big(0),
      lineText: '',
    });
  }
}

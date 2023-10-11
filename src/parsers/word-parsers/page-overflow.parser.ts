import Big from 'big.js';

import ChangeParserState from '../models/change-parser-state.interface';
import ParserState from '../models/parser.state';

export default class ParsePageOverflow implements ChangeParserState<void> {
  parse(state: ParserState): ParserState {
    const { pages, lines, lineText } = state.initial;

    return state.change({
      pages: pages.concat(lines.join('')),
      // Cut the current text and begin on a newline.
      lines: [],
      pageHeight: Big(0),
      lineText: lineText,
    });
  }
}

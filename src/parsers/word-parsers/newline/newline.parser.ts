import Big from 'big.js';

import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser-state.interface';

export default class ParseNewline implements ChangeParserState<void> {
  parse(state: ParserState): ParserState {
    return {
      ...state,
      textIndex: state.textIndex + 1,
      // Cut the current text and begin on a newline.
      lines: state.lines.concat(state.lineText + '\n'),
      pageHeight: state.pageHeight.add(state.lineHeight),
      lineWidth: Big(0),
      lineText: '',
    };
  }
}

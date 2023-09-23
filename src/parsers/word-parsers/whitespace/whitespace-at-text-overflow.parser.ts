import Big from 'big.js';

import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser.state';

export default class ParseWhitespaceAtTextOverflow
  implements ChangeParserState<void>
{
  parse(state: ParserState): ParserState {
    const { textIndex, lines, lineText, pageHeight, lineHeight } =
      state.initial;

    return state.change({
      textIndex: textIndex + 1,
      // Cut the current text and begin on a newline.
      lines: lines.concat(lineText),
      pageHeight: pageHeight.add(lineHeight),
      lineWidth: Big(0),
      lineText: ' ',
    });
  }
}

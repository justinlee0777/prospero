import Big from 'big.js';

import ChangeParserState from '../models/change-parser-state.interface';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParserState from '../models/parser.state';

export default class ParsePageOverflow implements ChangeParserState<void> {
  constructor(private readonly config: CreateTextParserConfig) {}

  parse(state: ParserState): ParserState {
    const { pageHeight, lineHeight, pages, lines, lineText } = state.initial;

    if (pageHeight.add(lineHeight).gte(this.config.pageHeight)) {
      return state.change({
        pages: pages.concat(lines.join('')),
        // Cut the current text and begin on a newline.
        lines: [],
        pageHeight: Big(0),
        lineText: lineText,
      });
    } else {
      return state;
    }
  }
}

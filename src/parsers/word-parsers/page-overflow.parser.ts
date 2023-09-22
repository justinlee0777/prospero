import Big from 'big.js';

import ChangeParserState from '../models/change-parser-state.interface';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParserState from '../models/parser-state.interface';

export default class ParsePageOverflow implements ChangeParserState<void> {
  constructor(private readonly config: CreateTextParserConfig) {}

  parse(state: ParserState): ParserState {
    if (state.pageHeight.add(state.lineHeight).gte(this.config.pageHeight)) {
      return {
        ...state,
        pages: state.pages.concat(state.lines.join('')),
        // Cut the current text and begin on a newline.
        lines: [],
        pageHeight: Big(0),
        lineText: state.lineText,
      };
    } else {
      return state;
    }
  }
}

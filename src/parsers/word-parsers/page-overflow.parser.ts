import Big from 'big.js';

import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParserState from '../models/parser-state.interface';

const pageOverflowParser =
  (config: CreateTextParserConfig) =>
  (state: ParserState): ParserState => {
    if (state.pageHeight.add(state.lineHeight).gte(config.pageHeight)) {
      return {
        ...state,
        pages: state.pages.concat(state.lines.join('')),
        changes: state.changes.concat({
          values: state.pageChanges,
        }),
        // Cut the current text and begin on a newline.
        lines: [],
        pageChanges: [],
        pageHeight: Big(0),
        lineText: state.lineText.trim(),
      };
    } else {
      return state;
    }
  };

export default pageOverflowParser;

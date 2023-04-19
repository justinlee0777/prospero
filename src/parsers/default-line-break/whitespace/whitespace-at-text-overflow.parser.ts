import Big from 'big.js';

import CreateTextParser from '../../models/create-text-parser.interface';

const createWhitespaceAtTextOverflowParser: CreateTextParser =
  (config) => (state, word) => {
    if (state.line + 1 >= config.pageLines) {
      return {
        ...state,
        pages: state.pages.concat(
          state.lines.join('') + state.lineText + word.text
        ),
        // Cut the current text and begin on a newline.
        lines: [],
        line: 0,
        lineWidth: Big(0),
        lineText: '',
      };
    } else {
      return {
        ...state,
        // Cut the current text and begin on a newline.
        lines: state.lines.concat(state.lineText),
        line: state.line + 1,
        lineWidth: Big(0),
        lineText: word.text,
      };
    }
  };

export default createWhitespaceAtTextOverflowParser;

import Big from 'big.js';

import CreateTextParser from '../../models/create-text-parser.interface';

const createWhitespaceAtTextOverflowParser: CreateTextParser =
  (config) => (state, word) => {
    return {
      ...state,
      // Cut the current text and begin on a newline.
      lines: state.lines.concat(state.lineText + word.text),
      line: state.line + 1,
      lineWidth: Big(0),
      lineText: word.text,
    };
  };

export default createWhitespaceAtTextOverflowParser;

import Big from 'big.js';

import CreateTextParser from '../../models/create-text-parser.interface';

const createNewlineParser: CreateTextParser = (config) => (state, word) => {
  return {
    ...state,
    // Cut the current text and begin on a newline.
    lines: state.lines.concat(state.lineText + word.text),
    line: state.line + 1,
    lineWidth: Big(config.textIndent.width),
    lineText: config.textIndent.text,
  };
};

export default createNewlineParser;

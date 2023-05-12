import Big from 'big.js';

import CreateTextParser from '../../models/create-text-parser.interface';

const createNewlineParser: CreateTextParser = (config) => (state, word) => {
  return {
    ...state,
    textIndex: state.textIndex + word.text.length,
    // Cut the current text and begin on a newline.
    lines: state.lines.concat(state.lineText + word.text),
    pageHeight: state.pageHeight.add(state.lineHeight),
    lineWidth: Big(0),
    lineText: '',
  };
};

export default createNewlineParser;

import Big from 'big.js';

import ParseWord from '../../models/parse-word.interface';

const createNewlineParser: ParseWord = (state, word) => {
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

import Big from 'big.js';

import ParseWord from '../../models/parse-word.interface';

const createWhitespaceAtTextOverflowParser: ParseWord = (state, word) => {
  return {
    ...state,
    textIndex: state.textIndex + word.text.length,
    // Cut the current text and begin on a newline.
    lines: state.lines.concat(state.lineText),
    pageHeight: state.pageHeight.add(state.lineHeight),
    lineWidth: Big(0),
    lineText: word.text,
  };
};

export default createWhitespaceAtTextOverflowParser;

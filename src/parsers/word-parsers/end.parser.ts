import Big from 'big.js';

import ParseWord from '../models/parse-word.interface';

const parseEnd: ParseWord = (state) => {
  return {
    ...state,
    pages: state.pages.concat(state.lines.join('') + state.lineText),
    changes: state.changes.concat({
      values: state.pageChanges,
    }),
    page: '',
    // Cut the current text and begin on a newline.
    lines: [],
    pageChanges: [],
    line: 0,
    lineWidth: Big(0),
    lineText: '',
  };
};

export default parseEnd;

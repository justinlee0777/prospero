import Big from 'big.js';

import ParserState from '../models/parser-state.interface';

const parseEnd: (state: ParserState) => ParserState = (state) => {
  return {
    ...state,
    pages: state.pages.concat(state.lines.join('') + state.lineText),
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

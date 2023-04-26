import Big from 'big.js';

import CreateTextParser from '../../models/create-text-parser.interface';

const createNewlineParser: CreateTextParser = (config) => (state, word) => {
  if (state.line + 1 >= config.pageLines) {
    return {
      ...state,
      pages: state.pages.concat(
        state.lines.join('') + state.lineText + word.text
      ),
      changes: state.changes.concat({
        values: state.pageChanges,
      }),
      textIndex: state.textIndex + word.text.length,
      // Cut the current text and begin on a newline.
      lines: [],
      pageChanges: [],
      line: 0,
      lineWidth: Big(0),
      lineText: '',
    };
  } else {
    return {
      ...state,
      textIndex: state.textIndex + word.text.length,
      // Cut the current text and begin on a newline.
      lines: state.lines.concat(state.lineText + word.text),
      line: state.line + 1,
      lineWidth: Big(0),
      lineText: '',
    };
  }
};

export default createNewlineParser;

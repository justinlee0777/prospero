import ParseText from '../../models/parse-text.interface';

const parseWordAtTextOverflow: ParseText = (state, word) => {
  return {
    ...state,
    // Cut the current text and begin on a newline.
    lines: state.lines.concat(state.lineText),
    line: state.line + 1,
    lineWidth: word.width,
    lineText: word.text,
  };
};

export default parseWordAtTextOverflow;

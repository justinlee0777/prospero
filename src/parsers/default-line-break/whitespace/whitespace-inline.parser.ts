import ParseText from '../../models/parse-text.interface';

const parseWhitespaceInline: ParseText = (state, word) => {
  return {
    ...state,
    lineWidth: state.lineWidth.plus(word.width),
    lineText: state.lineText + word.text,
  };
};

export default parseWhitespaceInline;

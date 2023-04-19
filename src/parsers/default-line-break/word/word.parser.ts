import ParseText from '../../models/parse-text.interface';

const parseWord: ParseText = (state, word) => {
  return {
    ...state,
    lineWidth: state.lineWidth.plus(word.width),
    lineText: state.lineText + word.text,
  };
};

export default parseWord;

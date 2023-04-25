import ParseWord from '../../models/parse-word.interface';

const parseWord: ParseWord = (state, word) => {
  return {
    ...state,
    textIndex: state.textIndex + word.text.length,
    lineWidth: state.lineWidth.plus(word.width),
    lineText: state.lineText + word.text,
  };
};

export default parseWord;

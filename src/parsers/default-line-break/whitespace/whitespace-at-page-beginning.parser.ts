import ParseWord from '../../models/parse-word.interface';

const parseWhitespaceAtPageBeginning: ParseWord = (state) => {
  // Do nothing; continue parsing line.
  return {
    ...state,
  };
};

export default parseWhitespaceAtPageBeginning;

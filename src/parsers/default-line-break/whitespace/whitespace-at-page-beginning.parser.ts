import ParseText from '../../models/parse-text.interface';

const parseWhitespaceAtPageBeginning: ParseText = (state) => {
  // Do nothing; continue parsing line.
  return {
    ...state,
  };
};

export default parseWhitespaceAtPageBeginning;

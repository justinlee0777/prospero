import ParseWord from '../../models/parse-word.interface';
import TextChangeType from '../../models/text-change-type.enum';

const parseWhitespaceAtPageBeginning: ParseWord = (state, word) => {
  // Do nothing; continue parsing line.
  return {
    ...state,
    pageChanges: state.pageChanges.concat({
      word: word.text,
      textIndex: state.textIndex,
      type: TextChangeType.DELETE_WORD,
    }),
  };
};

export default parseWhitespaceAtPageBeginning;

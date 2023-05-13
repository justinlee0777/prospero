import ParseWord from '../../models/parse-word.interface';
import TextChangeType from '../../models/text-change-type.enum';

const createNewlineAtPageBeginningParser: ParseWord = (state, word) => {
  // Ignore any newlines for new pages and begin with an indentation.
  return {
    ...state,
    pageChanges: state.pageChanges.concat({
      text: word.text,
      textIndex: state.textIndex,
      type: TextChangeType.DELETE_WORD,
    }),
  };
};

export default createNewlineAtPageBeginningParser;

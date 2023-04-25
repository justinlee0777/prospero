import Big from 'big.js';

import CreateTextParser from '../../models/create-text-parser.interface';
import TextChangeType from '../../models/text-change-type.enum';

const createNewlineAtPageBeginningParser: CreateTextParser =
  (config) => (state, word) => {
    // Ignore any newlines for new pages and begin with an indentation.
    return {
      ...state,
      pageChanges: state.pageChanges.concat({
        word: word.text,
        textIndex: state.textIndex,
        type: TextChangeType.DELETE_WORD,
      }),
      lineWidth: Big(config.textIndent.width),
      lineText: config.textIndent.text,
    };
  };

export default createNewlineAtPageBeginningParser;

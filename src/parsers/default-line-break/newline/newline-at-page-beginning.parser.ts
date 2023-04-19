import Big from 'big.js';

import CreateTextParser from '../../models/create-text-parser.interface';

const createNewlineAtPageBeginningParser: CreateTextParser =
  (config) => (state) => {
    // Ignore any newlines for new pages and begin with an indentation.
    return {
      ...state,
      lineWidth: Big(config.textIndent.width),
      lineText: config.textIndent.text,
    };
  };

export default createNewlineAtPageBeginningParser;

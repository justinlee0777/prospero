import CreateTextParser from '../../models/create-text-parser.interface';

const createWordAtTextOverflowParser: CreateTextParser =
  (config) => (state, word) => {
    return {
      ...state,
      textIndex: state.textIndex + word.text.length,
      // Cut the current text and begin on a newline.
      lines: state.lines.concat(state.lineText),
      pageHeight: state.pageHeight.add(state.lineHeight),
      lineWidth: word.width,
      lineText: word.text,
    };
  };

export default createWordAtTextOverflowParser;

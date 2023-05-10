import CreateTextParser from '../../models/create-text-parser.interface';

const createWordAtTextOverflowParser: CreateTextParser =
  (config) => (state, word) => {
    if (state.pageHeight.add(state.lineHeight).gte(config.pageHeight)) {
      return {
        ...state,
        pages: state.pages.concat(state.lines.join('') + state.lineText),
        changes: state.changes.concat({
          values: state.pageChanges,
        }),
        textIndex: state.textIndex + word.text.length,
        // Cut the current text and begin on a newline.
        lines: [],
        pageChanges: [],
        pageHeight: state.lineHeight,
        lineWidth: word.width,
        lineText: word.text,
      };
    } else {
      return {
        ...state,
        textIndex: state.textIndex + word.text.length,
        // Cut the current text and begin on a newline.
        lines: state.lines.concat(state.lineText),
        pageHeight: state.pageHeight.add(state.lineHeight),
        lineWidth: word.width,
        lineText: word.text,
      };
    }
  };

export default createWordAtTextOverflowParser;

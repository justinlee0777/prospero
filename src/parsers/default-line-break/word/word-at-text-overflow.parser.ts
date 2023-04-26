import CreateTextParser from '../../models/create-text-parser.interface';

const createWordAtTextOverflowParser: CreateTextParser =
  (config) => (state, word) => {
    if (state.line + 1 >= config.pageLines) {
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
        line: 0,
        lineWidth: word.width,
        lineText: word.text,
      };
    } else {
      return {
        ...state,
        textIndex: state.textIndex + word.text.length,
        // Cut the current text and begin on a newline.
        lines: state.lines.concat(state.lineText),
        line: state.line + 1,
        lineWidth: word.width,
        lineText: word.text,
      };
    }
  };

export default createWordAtTextOverflowParser;

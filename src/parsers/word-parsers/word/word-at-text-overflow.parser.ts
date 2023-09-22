import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser-state.interface';
import Word from '../../models/word.interface';

export default class ParseWordAtTextOverflow
  implements ChangeParserState<Word>
{
  parse(state: ParserState, word: Word): ParserState {
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
}

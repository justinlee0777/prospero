import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser.state';
import Word from '../../models/word.interface';

export default class ParseWordAtTextOverflow
  implements ChangeParserState<Word>
{
  parse(state: ParserState, word: Word): ParserState {
    const { textIndex, lines, lineText, pageHeight, lineHeight } =
      state.initial;

    return state.change({
      textIndex: textIndex + word.text.length,
      // Cut the current text and begin on a newline.
      lines: lines.concat(lineText),
      pageHeight: pageHeight.add(lineHeight),
      lineWidth: word.width,
      lineText: word.text,
    });
  }
}

import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser.state';
import Word from '../../models/word.interface';

export default class ParseWord implements ChangeParserState<Word> {
  parse(state: ParserState, word: Word): ParserState {
    const { textIndex, lineWidth, lineText } = state.initial;

    return state.change({
      ...state,
      textIndex: textIndex + word.text.length,
      lineWidth: lineWidth.plus(word.width),
      lineText: lineText + word.text,
    });
  }
}

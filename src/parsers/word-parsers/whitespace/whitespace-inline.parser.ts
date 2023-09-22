import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser-state.interface';
import Word from '../../models/word.interface';

export default class ParseWhitespaceInline implements ChangeParserState<Word> {
  parse(state: ParserState, word: Word): ParserState {
    return {
      ...state,
      textIndex: state.textIndex + word.text.length,
      lineWidth: state.lineWidth.plus(word.width),
      lineText: state.lineText + word.text,
    };
  }
}

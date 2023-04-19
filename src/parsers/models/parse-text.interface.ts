import ParserState from './parser-state.interface';
import Word from './word.interface';

export default interface ParseText {
  /**
   * @param state is the current state of the parser.
   * @param word to parse.
   * @returns a new ParserState.
   */
  (state: ParserState, word: Word): ParserState;
}

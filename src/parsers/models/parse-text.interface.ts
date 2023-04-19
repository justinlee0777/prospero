import ParserState from './parser-state.interface';
import Word from './word.interface';

export default interface ParseText {
  /**
   * @returns a new ParserState.
   */
  (state: ParserState, word: Word): ParserState;
}

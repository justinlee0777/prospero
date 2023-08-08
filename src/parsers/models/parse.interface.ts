import ParserState from './parser-state.interface';

export default interface Parse {
  /**
   * @param state is the current state of the parser.
   * @returns a new ParserState.
   */
  (state: ParserState): ParserState;
}

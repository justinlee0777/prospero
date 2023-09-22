import ParserState from './parser-state.interface';

export default interface ChangeParserState<Change> {
  /**
   * @param state is the current state of the parser.
   * @param word to parse.
   * @returns a new ParserState.
   */
  parse(state: ParserState, change: Change): ParserState;
}

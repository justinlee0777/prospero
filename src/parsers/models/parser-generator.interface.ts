import ParserState from './parser.state';

export default interface ParserGenerator {
  value: ParserState;
  done: boolean;

  /**
   *
   * @param changedParserState
   */
  next(changedParserState?: ParserState): ParserState;
}

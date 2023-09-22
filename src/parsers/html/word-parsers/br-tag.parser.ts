import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser-state.interface';
import ParseNewline from '../../word-parsers/newline/newline.parser';

/**
 * Handles the appearance of a <br/> tag - basically, is a newline.
 */
export default class ParseBRTag implements ChangeParserState<string> {
  private readonly parseNewline: ChangeParserState<void>;

  constructor() {
    this.parseNewline = new ParseNewline();
  }

  parse(state: ParserState, tag: string): ParserState {
    state = {
      ...state,
      lineText: state.lineText + tag,
    };

    return this.parseNewline.parse(state);
  }
}

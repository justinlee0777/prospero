import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser.state';
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
    const { lineText } = state.initial;

    state = state.change({
      lineText: lineText + tag,
    });

    return this.parseNewline.parse(state);
  }
}

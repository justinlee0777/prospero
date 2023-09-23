import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser.state';
import ParseNewline from '../../word-parsers/newline/newline.parser';
import ParseHTMLElementOpening from './html-element-opening.parser';

/**
 * Handles the opening of a block element.
 */
export default class ParseBlockElementOpening
  implements ChangeParserState<string>
{
  private readonly parseHTMLElementOpening: ChangeParserState<string>;
  private readonly parseNewline: ChangeParserState<void>;

  constructor() {
    this.parseHTMLElementOpening = new ParseHTMLElementOpening();
    this.parseNewline = new ParseNewline();
  }

  parse(state: ParserState, tagOpening: string): ParserState {
    const { lineText } = state.initial;

    if (lineText.length > 0) {
      state = this.parseNewline.parse(state);
    }

    return this.parseHTMLElementOpening.parse(state, tagOpening);
  }
}

import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser.state';
import ParseNewline from '../../word-parsers/newline/newline.parser';
import ParseHTMLElementClosing from './html-element-closing.parser';

/**
 * Handles the closing of a block element.
 */
export default class ParseBlockElementClosing
  implements ChangeParserState<string>
{
  private readonly parseHTMLElementClosing: ChangeParserState<string>;
  private readonly parseNewline: ChangeParserState<void>;

  constructor() {
    this.parseHTMLElementClosing = new ParseHTMLElementClosing();
    this.parseNewline = new ParseNewline();
  }

  parse(state: ParserState, tagEnding: string): ParserState {
    const newState = this.parseHTMLElementClosing.parse(state, tagEnding);
    return this.parseNewline.parse(newState);
  }
}

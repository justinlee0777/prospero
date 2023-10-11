import IWordParser from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser.state';

/**
 * Handles the closing of an HTML element.
 */
export default class ParseHTMLElementClosing implements IWordParser<string> {
  parse(state: ParserState, tagEnding: string): ParserState {
    const { lineText } = state.initial;

    return state.change({
      lineText: lineText + tagEnding,
    });
  }
}

import IParseWord from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser.state';

/**
 * Handles the opening of an HTML element.
 */
export default class ParseHTMLElementOpening implements IParseWord<string> {
  parse(state: ParserState, tagOpening: string): ParserState {
    const { lineText } = state.initial;

    return state.change({
      lineText: lineText + tagOpening,
    });
  }
}

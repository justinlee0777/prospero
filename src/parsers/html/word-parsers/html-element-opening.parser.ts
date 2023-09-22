import IParseWord from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser-state.interface';

/**
 * Handles the opening of an HTML element.
 */
export default class ParseHTMLElementOpening implements IParseWord<string> {
  parse(state: ParserState, tagOpening: string): ParserState {
    return {
      ...state,
      lineText: state.lineText + tagOpening,
    };
  }
}

import IWordParser from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser-state.interface';

/**
 * Handles the closing of an HTML element.
 */
export default class ParseHTMLElementClosing implements IWordParser<string> {
  parse(state: ParserState, tagEnding: string): ParserState {
    return {
      ...state,
      lineText: state.lineText + tagEnding,
    };
  }
}

import ParserState from '../../models/parser.state';
import ParsePageOverflow from '../../word-parsers/page-overflow.parser';
import HTMLContext from '../html-context.interface';

/**
 * Update the last page with HTML tags when there is a page overflow.
 */
export default class ParseHTMLPageOverflow extends ParsePageOverflow {
  constructor(private readonly htmlContext: HTMLContext) {
    super();
  }

  parse(state: ParserState): ParserState {
    state = super.parse(state);

    const openingTag = this.htmlContext.getOpeningTag();
    const closingTag = this.htmlContext.getClosingTag();

    let { pages, lineText } = state.initial;

    pages = [...pages];

    pages[pages.length - 1] = pages[pages.length - 1] + closingTag;

    lineText = openingTag + lineText;

    state = state.change({
      pages,
      lineText,
    });

    return state;
  }
}

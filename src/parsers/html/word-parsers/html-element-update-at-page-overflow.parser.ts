import ChangeParserState from '../../models/change-parser-state.interface';
import ParserState from '../../models/parser-state.interface';
import ElementOverflowArgs from './element-overflow-args.interface';

/**
 * Update the parse state when an HTML element is carried over from page to page ex. a colored <span> element
 * whose text carries over to the next page.
 * TODO: Can't this be done better? Rather than hacking the code by sending in the previous ParserState?
 * For example, by incorporating and listening to "new page" events?
 */
export default class UpdateHTMLElementAtPageOverflow
  implements ChangeParserState<ElementOverflowArgs>
{
  parse(state: ParserState, change: ElementOverflowArgs): ParserState {
    const { previous } = change;
    if (previous) {
      const previousLength = previous.pages.length;
      const diff = state.pages.length - previousLength;

      if (diff > 0) {
        const { openingTags: openingTag, closingTags: closingTag } = change;

        let { pages, lineText } = state;

        pages = [...pages];

        pages[previousLength] += closingTag;

        for (let i = 1; i < diff; i++) {
          let page = pages[previousLength + i] ?? '';

          page = openingTag + page;

          pages[previousLength + i] = page;
        }

        lineText = openingTag + lineText;

        state = {
          ...state,
          pages,
          lineText,
        };
      }
    }

    return state;
  }
}

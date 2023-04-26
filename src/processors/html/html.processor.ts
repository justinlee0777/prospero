import { cloneDeep } from 'lodash-es';

import ParserState from '../../parsers/models/parser-state.interface';
import Processor from '../models/processor.interface';
import TextChange, {
  AddTextChange,
  DeleteTextChange,
} from '../../parsers/models/text-change.interface';
import TextChangeType from '../../parsers/models/text-change-type.enum';

/**
 * Memorized description of HTML tags for (ideally) quick and simple replacements in the text.
 */
interface HTMLTag {
  /**
   * This is saved as the opening tag contains all the important HTML attributes, thanks to HTML conventions.
   * ex. <span style="color: red">
   */
  openingTag: string;
  /** ex. span, div, p */
  tagName: string;
  /** Indices in the original text where the tags were found. */
  indices: {
    begin: number;
    end: number;
  };
}

/**
 * Remove and add HTML tags into pages.
 */
export default class HTMLProcessor implements Processor {
  /**
   * Omitting non-closing tags for the time-being as those - afaik - are not allowed.
   * Capture groups
   * First: the entire opening tag, plus attributes
   * Second: the tag name itself
   * Third: the tag content
   *
   * To be unit tested one day:
   * Allowed:
   * - <div>foo</div>
   * - <span>bar</span>
   * - <span style="color: blue">foo</span>
   * Disallowed:
   * - <span>foo</div>
   * - foo
   * - <span>bar
   * - baz</span>
   * - baz<span>
   */
  private static HTMLRegex = /(<([A-Za-z]+).*?>)([^<>]*)<\/\2>/g;

  private htmlTags: Array<HTMLTag> = [];

  private previousParserState: ParserState | undefined;
  /** Keeps track of the page lengths before changes are made, as the HTML replacements will cause a human to go insane. */
  private nextPageBegin = 0;

  preprocess(text: string): string {
    // Offsetting the index returned by 'replace' after the replacement has occurred (as the function does not do so.)
    let normalizedOffset = 0;

    return text.replace(
      HTMLProcessor.HTMLRegex,
      (
        _,
        openingTag: string,
        tagName: string,
        tagContent: string,
        index: number
      ) => {
        const memoizedTag: HTMLTag = {
          openingTag,
          tagName,
          indices: {
            begin: index - normalizedOffset,
            end: index - normalizedOffset + tagContent.length,
          },
        };

        this.htmlTags.push(memoizedTag);

        const reconstructedTag = this.reconstructHTMLString(memoizedTag);

        normalizedOffset += reconstructedTag.length;

        return tagContent;
      }
    );
  }

  process(parserState: ParserState): ParserState {
    const newParserState = cloneDeep(parserState);

    const pageLength = this.previousParserState?.pages.length ?? 0;
    const pageDifference = parserState.pages.length - pageLength;

    if (pageDifference > 0) {
      // Only act on pages so that the entire page text can be operated on, rather than line chunks.

      const pages = newParserState.pages.slice(0, pageLength);
      const newPages = newParserState.pages.slice(pageLength);

      const changes = newParserState.changes.slice(0, pageLength);
      const newChanges = newParserState.changes.slice(pageLength);

      for (let i = 0; i < newPages.length; i++) {
        // Get the relevant page changes that change the text indices.
        const pageChanges = newChanges[i].values.filter(
          (change) =>
            change.type === TextChangeType.DELETE_WORD ||
            change.type === TextChangeType.ADD_WORD
        );

        /*
         * Using the page changes, adjust the existing word tag indices.
         * We adjust every tag that happens at or after the word change.
         */
        pageChanges.forEach((change: AddTextChange | DeleteTextChange) => {
          this.htmlTags.forEach((htmlTag) => {
            // If words are added, push the index by the word amount. If words are deleted, set it back.
            const offset = change.type === TextChangeType.ADD_WORD ? 1 : -1;
            const wordLength = offset * change.text.length;

            if (htmlTag.indices.begin >= change.textIndex) {
              htmlTag.indices.begin = htmlTag.indices.begin + wordLength;
              htmlTag.indices.end = htmlTag.indices.end + wordLength;
            }
          });
        });

        const { text, changes: addedChanges } = this.processPage(newPages[i]);

        pages.push(text);
        changes.push({
          values: [...pageChanges, ...addedChanges],
        });
      }

      // Update the parser state to manifest the changes.
      newParserState.pages = pages;
      // Remember to inform other processors of your own changes.
      newParserState.changes = changes;
    }

    this.previousParserState = newParserState;

    return newParserState;
  }

  /**
   * @param page text generated.
   * @returns the transformed text with tags and changes describing the operations.
   */
  private processPage(page: string): {
    text: string;
    changes: Array<TextChange>;
  } {
    let { nextPageBegin } = this;
    const pageLength = page.length;

    let nextPageEnd = nextPageBegin + pageLength;

    /*
     * Using the indices from the original text (and NOT the page's indices) as the bounds,
     * find the tags that need to be applied for this page.
     * As pages can cut off tags, we want a union of tags that include the beginning index and ending index.
     */
    const relevantTags = this.htmlTags
      .filter((htmlTag) => {
        const {
          indices: { begin, end },
        } = htmlTag;

        return (
          (nextPageBegin <= begin && begin <= nextPageEnd) ||
          (nextPageBegin <= end && end <= nextPageEnd)
        );
      })
      // reversing the tags so that we may work backwards and not be confused by changing indexes
      .reverse();

    let postProccessedPage = page;
    const newChanges: Array<TextChange> = [];

    /*
     * For each relevant tag,
     * - calculate the normalized beginning and end (as in, convert the index for the entire text into the page's index (bigger bounds to smaller))
     * - reconstruct the HTML string: foo -> <span style="color: red">foo</span>
     * - replace the text content -> text content bound by tag
     * - record a description of the changes
     */
    relevantTags.forEach((tag) => {
      const {
        indices: { begin, end },
      } = tag;
      const normalizedBegin = Math.max(begin - nextPageBegin, 0);
      const normalizedEnd = Math.min(end - nextPageBegin, pageLength);
      const textContent = page.slice(normalizedBegin, normalizedEnd);

      const reconstructedTag = this.reconstructHTMLString(tag, textContent);

      postProccessedPage = `${postProccessedPage.slice(
        0,
        normalizedBegin
      )}${reconstructedTag}${postProccessedPage.slice(normalizedEnd)}`;

      newChanges.unshift({
        original: textContent,
        replacement: reconstructedTag,
        textIndex: normalizedBegin + nextPageBegin,
        type: TextChangeType.REPLACE,
      });
    });

    this.nextPageBegin = nextPageBegin + pageLength;

    return {
      text: postProccessedPage,
      changes: newChanges,
    };
  }

  /**
   * @returns the text content bound by the HTML tag.
   */
  private reconstructHTMLString(
    { openingTag, tagName }: HTMLTag,
    withTextContent = ''
  ): string {
    return `${openingTag}${withTextContent}</${tagName}>`;
  }
}

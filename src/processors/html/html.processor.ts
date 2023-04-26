import { cloneDeep } from 'lodash-es';

import ParserState from '../../parsers/models/parser-state.interface';
import Processor from '../models/processor.interface';
import TextChange, {
  DeleteWordChange,
} from '../../parsers/models/text-change.interface';
import TextChangeType from '../../parsers/models/text-change-type.enum';

interface HTMLTag {
  openingTag: string;
  tagName: string;
  indices: {
    begin: number;
    end: number;
  };
}

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

  private preprocessedPages: Array<string> = [];
  private previousParserState: ParserState | undefined;
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

  postprocess(parserState: ParserState): ParserState {
    const newParserState = cloneDeep(parserState);

    const pageLength = this.previousParserState?.pages.length ?? 0;
    const pageDifference = parserState.pages.length - pageLength;

    if (pageDifference > 0) {
      const pages = newParserState.pages.slice(0, pageLength);
      const newPages = newParserState.pages.slice(pageLength);

      const changes = newParserState.changes.slice(0, pageLength);
      const newChanges = newParserState.changes.slice(pageLength);

      for (let i = 0; i < newPages.length; i++) {
        const pageChanges = newChanges[i].values.filter(
          (change) => change.type === TextChangeType.DELETE_WORD
        );

        pageChanges.forEach((change: DeleteWordChange) => {
          this.htmlTags.forEach(htmlTag => {
            if (htmlTag.indices.begin >= change.textIndex) {
              htmlTag.indices.begin = htmlTag.indices.begin - change.word.length;
              htmlTag.indices.end = htmlTag.indices.end - change.word.length;
            }
          });
        });

        const { text, changes: addedChanges } = this.processPage(newPages[i]);

        pages.push(text);
        changes.push({
          values: [...pageChanges, ...addedChanges],
        });
      }

      newParserState.pages = pages;
      newParserState.changes = changes;
    }

    this.previousParserState = newParserState;

    return newParserState;
  }

  private processPage(page: string): { text: string; changes: Array<TextChange> } {
    this.preprocessedPages.push(page);

    let { nextPageBegin } = this;
    const pageLength = page.length;

    let nextPageEnd = nextPageBegin + pageLength;

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

  private reconstructHTMLString(
    { openingTag, tagName }: HTMLTag,
    withTextContent = ''
  ): string {
    return `${openingTag}${withTextContent}</${tagName}>`;
  }
}

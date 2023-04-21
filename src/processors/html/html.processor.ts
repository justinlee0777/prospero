import Processor from '../models/processor.interface';
import TextStyle from '../models/text-style.interface';

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
  private nextPageBegin = 0;

  preprocess(text: string, textStyle: TextStyle): string {
    // Offsetting the index returned by 'replace' after the replacement has occurred (as the function does not do so.)
    let normalizedOffset = -(textStyle.textIndent ?? '').length;

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

  postprocess(...pages: Array<string>): Array<string> {
    return pages.map((page) => {
      this.preprocessedPages.push(page);

      const { nextPageBegin } = this;
      const pageLength = page.length;

      const nextPageEnd = nextPageBegin + pageLength;

      const relevantTags = this.htmlTags
        .filter((htmlTag) => {
          const {
            indices: { begin },
          } = htmlTag;
          return nextPageBegin < begin && begin < nextPageEnd;
        })
        // reversing the tags so that we may work backwards and not be confused by changing indexes
        .reverse();

      let postProccessedPage = page;

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
      });

      this.nextPageBegin += pageLength;

      return postProccessedPage;
    });
  }

  private reconstructHTMLString(
    { openingTag, tagName }: HTMLTag,
    withTextContent = ''
  ): string {
    return `${openingTag}${withTextContent}</${tagName}>`;
  }
}

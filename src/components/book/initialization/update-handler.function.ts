import GetPage from '../../../get-page.interface';
import PageNumberingAlignment from '../../page/page-numbering-alignment.enum';
import pageSelector from '../../page/page-selector.const';
import PageComponent from '../../page/page.component';
import BookComponent from '../book.component';
import PageChangeEvent from '../page-change-event.interface';

interface PageConfig {
  get: GetPage;
  pagesShown: number;

  styles?: Partial<CSSStyleDeclaration>;
}

/**
 * @returns whether the operation completed or halted early.
 */
type UpdatePage = (this: void, currentPage: number) => boolean;

/**
 * @returns a handler to update the page.
 */
export default function updateHandler(
  book: BookComponent,
  { get, pagesShown, styles = {} }: PageConfig
): UpdatePage {
  return (pageNumber: number) => {
    const leftmostPage = pageNumber - (pageNumber % pagesShown);
    const pageNumbers = Array(pagesShown)
      .fill(undefined)
      .map((_, i) => leftmostPage + i);

    const offset = 100 / pagesShown;

    const pageContent = pageNumbers.map((number) => ({
      number,
      content: get(number),
    }));

    if (pageContent.every(({ content }) => !Boolean(content))) {
      return false;
    }

    const oldPages = [
      ...book.querySelectorAll(pageSelector),
    ] as Array<PageComponent>;

    const pages = pageContent.map(({ number, content }, i) =>
      PageComponent(
        {
          numbering: {
            alignment:
              number % 2 === 0
                ? PageNumberingAlignment.LEFT
                : PageNumberingAlignment.RIGHT,
            pageNumber: number + 1,
          },
        },
        {
          innerHTML: content,
          styles: {
            ...styles,
            left: `${offset * i}%`,
          },
        }
      )
    );

    book.prepend(...pages);

    const pageChangeEvent: PageChangeEvent = {
      pageNumber,
      animationFinished: Promise.all(
        oldPages.map((oldPage) => oldPage.destroy())
      ).then(),
    };

    book.onpagechange?.(pageChangeEvent);

    return true;
  };
}

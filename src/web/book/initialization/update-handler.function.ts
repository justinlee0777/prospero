import CreateElementConfig from '../../../elements/create-element.config';
import GetPage from '../../../get-page.interface';
import merge from '../../../utils/merge.function';
import PageNumberingAlignment from '../../page/page-numbering-alignment.enum';
import pageSelector from '../../page/page-selector.const';
import PageComponent from '../../page/page.component';
import BookAnimation from '../book-animation.interface';
import BookComponent from '../book.component';
import PageChangeEvent from '../page-change-event.interface';
import UpdatePage from '../update-page.interface';

interface PageConfig {
  get: GetPage;
  pagesShown: number;
  animation: BookAnimation;
  showPageNumbers: boolean;

  elementConfig?: CreateElementConfig;
}

/**
 * @returns a handler to update the page.
 */
export default function updateHandler(
  book: BookComponent,
  {
    get,
    pagesShown,
    animation,
    elementConfig = {},
    showPageNumbers,
  }: PageConfig
): UpdatePage {
  return async (pageNumber: number) => {
    const leftmostPage = pageNumber - (pageNumber % pagesShown);
    const pageNumbers = Array(pagesShown)
      .fill(undefined)
      .map((_, i) => leftmostPage + i);

    const offset = 100 / pagesShown;

    const pageContent = await Promise.all(
      pageNumbers.map((number) =>
        Promise.resolve(get(number)).then((content) => ({ number, content }))
      )
    );

    if (pageContent.every(({ content }) => content === null)) {
      return false;
    }

    const oldPages = [
      ...book.querySelectorAll(pageSelector),
    ] as Array<PageComponent>;

    const pages = pageContent.map(({ number, content }, i) => {
      let numbering;

      if (showPageNumbers) {
        numbering = {
          alignment:
            number % 2 === 0
              ? PageNumberingAlignment.LEFT
              : PageNumberingAlignment.RIGHT,
          pageNumber: number + 1,
        };
      }

      return PageComponent(
        {
          numbering,
        },
        merge<CreateElementConfig>(
          {
            innerHTML: content,
            styles: {
              left: `${offset * i}%`,
            },
          },
          elementConfig
        )
      );
    });

    /*
     * The animation handles the actual page changing as it may need to control
     * how and when the pages are deleted.
     */
    const animationFinished = animation.changePage(
      book,
      pageNumber,
      oldPages,
      pages
    );

    const pageChangeEvent: PageChangeEvent = {
      pageNumber,
      animationFinished,
    };

    book.onpagechange?.(pageChangeEvent);

    return true;
  };
}

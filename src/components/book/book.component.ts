import './book.css';

import div from '../../elements/div.function';
import GetPage from '../../get-page.interface';
import createKeydownListener from '../../elements/create-keydown-listener.function';
import Page from '../page/page.component';
import pageSelector from '../page/page-selector.const';
import PageElement from '../page/page-element.interface';
import { PageFlipAnimation } from '../page/page-flip-animation.enum';

interface BookArgs {
  getPage: GetPage;

  currentPage?: number;
}

interface PageChangeEvent {
  pageNumber: number;
  animationFinished: Promise<void>;
}

interface BookElement extends HTMLElement {
  onpagechange?: (event: PageChangeEvent) => void;
}

export default function Book({ getPage, currentPage }: BookArgs): BookElement {
  currentPage ??= 0;

  const book = div({
    classnames: ['book'],
    attributes: {
      tabindex: 0,
    },
  }) as BookElement;

  const goToPage = createGoToPage(book, getPage);

  const updatePage = (newPageNumber: number, pageFlip: PageFlipAnimation) => {
    const pageChangeFinished = goToPage(newPageNumber, pageFlip);

    if (pageChangeFinished) {
      currentPage = newPageNumber;
      book.onpagechange?.({
        pageNumber: newPageNumber,
        animationFinished: pageChangeFinished,
      });
    }
  };

  book.addEventListener(
    'keydown',
    createKeydownListener({
      ArrowRight: () => updatePage(currentPage + 1, PageFlipAnimation.RIGHT),
      ArrowLeft: () => updatePage(currentPage - 1, PageFlipAnimation.LEFT),
    })
  );

  goToPage(currentPage);

  return book;
}

function createGoToPage(
  book: BookElement,
  getPage: GetPage
): (pageNumber: number, animation?: PageFlipAnimation) => Promise<void> | null {
  return (pageNumber, pageFlip) => {
    const textContent = getPage(pageNumber);

    if (!textContent) {
      return null;
    }

    const oldPages = [
      ...book.querySelectorAll(pageSelector),
    ] as Array<PageElement>;

    const page = Page(textContent);

    book.prepend(page);

    return Promise.all(
      oldPages.map((oldPage) => oldPage.destroy({ pageFlip }))
    ).then();
  };
}

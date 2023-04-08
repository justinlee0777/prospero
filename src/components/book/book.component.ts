import styles from './book.module.css';

import div from '../../elements/div.function';
import GetPage from '../../get-page.interface';
import createKeydownListener from '../../elements/create-keydown-listener.function';
import Page from '../page/page.component';
import pageSelector from '../page/page-selector.const';
import PageElement from '../page/page-element.interface';
import PageFlipAnimation from '../page/page-flip-animation.enum';
import { CreateElementConfig } from '../../elements/create-element.interface';
import BookElement from './book-element.interface';
import registerSwipeListener from '../../elements/register-swipe-listener.function';
import SwipeDirection from '../../elements/swipe-direction.enum';
import ContainerStyle from '../../container-style.interface';
import containerStyleToStyleDeclaration from '../../utils/container-style-to-style-declaration.function';

interface BookArgs {
  getPage: GetPage;

  currentPage?: number;
  containerStyles?: ContainerStyle;
}

interface CreateBookElement {
  (book: BookArgs, config?: CreateElementConfig): BookElement;
}

const Book: CreateBookElement = (
  { getPage, currentPage, containerStyles },
  config
) => {
  currentPage ??= 0;
  config ??= {};

  let bookStyles: Partial<CSSStyleDeclaration>;
  let pageStyles: Partial<CSSStyleDeclaration>;

  if (containerStyles) {
    const styles = containerStyleToStyleDeclaration(containerStyles);

    bookStyles = {
      width: styles.width,
      height: styles.height,
      fontSize: styles.fontSize,
      fontFamily: styles.fontFamily,
      lineHeight: styles.lineHeight,
    };

    pageStyles = {
      paddingTop: styles.paddingTop,
      paddingRight: styles.paddingRight,
      paddingBottom: styles.paddingBottom,
      paddingLeft: styles.paddingLeft,
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginBottom: styles.marginBottom,
      marginLeft: styles.marginLeft,
      borderTopWidth: styles.borderTopWidth,
      borderRightWidth: styles.borderRightWidth,
      borderBottomWidth: styles.borderBottomWidth,
      borderLeftWidth: styles.borderLeftWidth,
    };
  }

  const classnames = [styles.book].concat(config?.classnames ?? []);
  const attributes = {
    ...(config.attributes ?? {}),
    tabindex: 0,
  };

  const book = div({
    ...config,
    classnames,
    attributes,
    styles: bookStyles,
  }) as unknown as BookElement;

  const goToPage = createGoToPage(book, getPage, pageStyles);

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

  const keydownListener = createKeydownListener({
    ArrowRight: () => updatePage(currentPage + 1, PageFlipAnimation.RIGHT),
    ArrowDown: () => updatePage(currentPage + 1, PageFlipAnimation.RIGHT),
    ArrowLeft: () => updatePage(currentPage - 1, PageFlipAnimation.LEFT),
    ArrowUp: () => updatePage(currentPage - 1, PageFlipAnimation.LEFT),
  });

  book.addEventListener('keydown', keydownListener);

  const destroySwipeListener = registerSwipeListener(book, ([direction]) => {
    switch (direction) {
      case SwipeDirection.UP:
        return updatePage(currentPage - 1, PageFlipAnimation.LEFT);
      case SwipeDirection.RIGHT:
        return updatePage(currentPage + 1, PageFlipAnimation.RIGHT);
      case SwipeDirection.DOWN:
        return updatePage(currentPage + 1, PageFlipAnimation.RIGHT);
      case SwipeDirection.LEFT:
        return updatePage(currentPage - 1, PageFlipAnimation.LEFT);
    }
  });

  book.destroy = () => {
    book.removeEventListener('keydown', keydownListener);
    destroySwipeListener();
  };

  goToPage(currentPage);

  return book;
};

function createGoToPage(
  book: BookElement,
  getPage: GetPage,
  pageStyles?: Partial<CSSStyleDeclaration>
): (pageNumber: number, animation?: PageFlipAnimation) => Promise<void> | null {
  return (pageNumber, pageFlip) => {
    const textContent = getPage(pageNumber);

    if (!textContent) {
      return null;
    }

    const oldPages = [
      ...book.querySelectorAll(pageSelector),
    ] as Array<PageElement>;

    const page = Page({ textContent, styles: pageStyles });

    book.prepend(page);

    return Promise.all(
      oldPages.map((oldPage) => oldPage.destroy({ pageFlip }))
    ).then();
  };
}

export default Book;

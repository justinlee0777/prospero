import styles from './book.module.css';

import div from '../../elements/div.function';
import GetPage from '../../get-page.interface';
import createKeydownListener from '../../elements/create-keydown-listener.function';
import PageComponent from '../page/page.component';
import pageSelector from '../page/page-selector.const';
import PageFlipAnimation from '../page/page-flip-animation.enum';
import BookComponent from './book-element.interface';
import registerSwipeListener from '../../elements/register-swipe-listener.function';
import SwipeDirection from '../../elements/swipe-direction.enum';
import containerStyleToStyleDeclaration from '../../utils/container-style-to-style-declaration.function';
import PageLayout from './page-layout.enum';
import toPixelUnits from '../../utils/to-pixel-units.function';
import CreateBookElement from './create-book-element.interface';
import PageNumberingAlignment from '../page/page-numbering-alignment.enum';

const BookComponent: CreateBookElement = (
  { getPage, currentPage = 0, containerStyles, pageLayout = PageLayout.SINGLE },
  config = {}
) => {
  let bookStyles: Partial<CSSStyleDeclaration>;
  let pageStyles: Partial<CSSStyleDeclaration>;

  if (containerStyles) {
    const styles = containerStyleToStyleDeclaration(containerStyles);

    let bookWidth = styles.width;
    let pageWidth: string;

    if (pageLayout === PageLayout.DOUBLE) {
      bookWidth = `${toPixelUnits(styles.width) * 2}px`;
      pageWidth = styles.width;
    }

    bookStyles = {
      width: bookWidth,
      height: styles.height,
      fontSize: styles.fontSize,
      fontFamily: styles.fontFamily,
      lineHeight: styles.lineHeight,
      borderTopWidth: styles.borderTopWidth,
      borderRightWidth: styles.borderRightWidth,
      borderBottomWidth: styles.borderBottomWidth,
      borderLeftWidth: styles.borderLeftWidth,
    };

    pageStyles = {
      width: pageWidth,
      paddingTop: styles.paddingTop,
      paddingRight: styles.paddingRight,
      paddingBottom: styles.paddingBottom,
      paddingLeft: styles.paddingLeft,
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginBottom: styles.marginBottom,
      marginLeft: styles.marginLeft,
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
    styles: {
      ...(config.styles ?? {}),
      ...bookStyles,
    },
  }) as unknown as BookComponent;

  let goToPage;
  let inc;

  if (pageLayout === PageLayout.SINGLE) {
    goToPage = createGoToSinglePage(book, getPage, pageStyles);
    inc = 1;
  } else {
    goToPage = createGoToDoublePage(book, getPage, pageStyles);
    inc = 2;
  }

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
    ArrowRight: () => updatePage(currentPage + inc, PageFlipAnimation.RIGHT),
    ArrowDown: () => updatePage(currentPage + inc, PageFlipAnimation.RIGHT),
    ArrowLeft: () => updatePage(currentPage - inc, PageFlipAnimation.LEFT),
    ArrowUp: () => updatePage(currentPage - inc, PageFlipAnimation.LEFT),
  });

  book.addEventListener('keydown', keydownListener);

  const destroySwipeListener = registerSwipeListener(book, ([direction]) => {
    switch (direction) {
      case SwipeDirection.UP:
        return updatePage(currentPage - inc, PageFlipAnimation.LEFT);
      case SwipeDirection.RIGHT:
        return updatePage(currentPage + inc, PageFlipAnimation.RIGHT);
      case SwipeDirection.DOWN:
        return updatePage(currentPage + inc, PageFlipAnimation.RIGHT);
      case SwipeDirection.LEFT:
        return updatePage(currentPage - inc, PageFlipAnimation.LEFT);
    }
  });

  book.destroy = () => {
    book.removeEventListener('keydown', keydownListener);
    destroySwipeListener();
  };

  goToPage(currentPage);

  return book;
};

function createGoToSinglePage(
  book: BookComponent,
  getPage: GetPage,
  pageStyles: Partial<CSSStyleDeclaration> = {}
): (pageNumber: number, animation?: PageFlipAnimation) => Promise<void> | null {
  return (pageNumber, pageFlip) => {
    const innerHTML = getPage(pageNumber);

    if (!innerHTML) {
      return null;
    }

    const oldPages = [
      ...book.querySelectorAll(pageSelector),
    ] as Array<PageComponent>;

    const page = PageComponent(
      {
        numbering: {
          alignment: PageNumberingAlignment.LEFT,
          pageNumber: pageNumber + 1,
        },
      },
      { innerHTML, styles: { ...pageStyles, borderRadius: '12px' } }
    );

    book.prepend(page);

    return Promise.all(
      oldPages.map((oldPage) => oldPage.destroy({ pageFlip }))
    ).then();
  };
}

function createGoToDoublePage(
  book: BookComponent,
  getPage: GetPage,
  pageStyles: Partial<CSSStyleDeclaration> = {}
): (pageNumber: number, animation?: PageFlipAnimation) => Promise<void> | null {
  return (pageNumber, pageFlip) => {
    let pageNumbers: [number, number];

    if (pageNumber % 2 === 0) {
      pageNumbers = [pageNumber, pageNumber + 1];
    } else {
      pageNumbers = [pageNumber - 1, pageNumber];
    }

    const pageContent = pageNumbers.map((page) => getPage(page));

    if (pageContent.every((textContent) => !Boolean(textContent))) {
      return null;
    }

    const oldPages = [
      ...book.querySelectorAll(pageSelector),
    ] as Array<PageComponent>;

    const pages = [
      PageComponent(
        {
          numbering: {
            alignment: PageNumberingAlignment.LEFT,
            pageNumber: pageNumbers[0] + 1,
          },
        },
        {
          innerHTML: pageContent[0],
          styles: {
            ...pageStyles,
            // TODO: DISALLOWED!
            // borderRight: '1px solid black',
          },
        }
      ),
      PageComponent(
        {
          numbering: {
            alignment: PageNumberingAlignment.RIGHT,
            pageNumber: pageNumbers[1] + 1,
          },
        },
        {
          innerHTML: pageContent[1],
          styles: {
            ...pageStyles,
            left: pageStyles.width,
          },
        }
      ),
    ];

    book.prepend(...pages);

    return Promise.all(
      oldPages.map((oldPage) => oldPage.destroy({ pageFlip }))
    ).then();
  };
}

export default BookComponent;

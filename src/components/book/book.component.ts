import BookComponent from './book-element.interface';
import containerStyleToStyleDeclaration from '../../utils/container-style-to-style-declaration.function';
import toPixelUnits from '../../utils/to-pixel-units.function';
import CreateBookElement from './create-book-element.interface';
import updateHandler from './initialization/update-handler.function';
import initialize from './initialization/initialize.function';
import listenToKeyboardEvents from './initialization/listen-to-keyboard-events.function';
import listenToSwipeEvents from './initialization/listen-to-swipe-events.function';

const BookComponent: CreateBookElement = (
  {
    getPage,
    currentPage = 0,
    pageStyles: userDefinedPageStyles = {},
    containerStyles,
    pagesShown = 1,
  },
  config = {}
) => {
  let bookStyles: Partial<CSSStyleDeclaration>;
  let pageStyles: Partial<CSSStyleDeclaration>;

  if (containerStyles) {
    const styles = containerStyleToStyleDeclaration(containerStyles);

    const bookWidth = `${toPixelUnits(styles.width) * pagesShown}px`;
    const pageWidth = styles.width;

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
      ...userDefinedPageStyles,
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

  const book = initialize({
    ...config,
    styles: {
      ...(config.styles ?? {}),
      ...bookStyles,
    },
  });

  const goToPage = updateHandler(book, {
    get: getPage,
    pagesShown,
    styles: pageStyles,
  });

  const decrement = () =>
    goToPage(currentPage - pagesShown) && (currentPage -= pagesShown);
  const increment = () =>
    goToPage(currentPage + pagesShown) && (currentPage += pagesShown);

  const destroyKeyboardListener = listenToKeyboardEvents(book, [
    decrement,
    increment,
  ]);

  const destroySwipeListener = listenToSwipeEvents(book, [
    decrement,
    increment,
  ]);

  book.destroy = () => {
    destroyKeyboardListener();
    destroySwipeListener();
  };

  goToPage(currentPage);

  return book;
};

export default BookComponent;

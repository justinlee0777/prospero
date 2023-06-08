import { merge } from 'lodash-es';
import CreateElementConfig from '../../elements/create-element.config';
import GetPage from '../../get-page.interface';
import LaminaComponent from '../lamina/lamina.component';
import BookComponent from './book-element.interface';
import BookIdentifier from './book.symbol';
import CreateBookElement from './create-book-element.interface';
import defaultBookConfig from './default-book-config.const';
import getBookStyles from './initialization/get-book-styles.function';
import initialize from './initialization/initialize.function';
import updateHandler from './initialization/update-handler.function';

const BookComponent: CreateBookElement = (
  args,
  bookConfig = defaultBookConfig,
  config = {}
) => {
  bookConfig = {
    ...defaultBookConfig,
    ...bookConfig,
  };

  const {
    pageStyles: userDefinedPageStyles,
    pagesShown,
    media,
    animation,
    listeners,
    showPageNumbers,
    theme,
  } = bookConfig;

  let { currentPage } = bookConfig;

  const { containerStyles } = args;
  let getPage: GetPage;

  if ('pages' in args) {
    getPage = (pageNumber) => {
      if (pageNumber < 0 || pageNumber >= args.pages.length) {
        return null;
      } else {
        return args.pages[pageNumber];
      }
    };
  } else {
    getPage = args.getPage;
  }

  const [bookStyles, pageStyles] = getBookStyles(
    containerStyles,
    userDefinedPageStyles,
    pagesShown
  );

  const destroyCallbacks = [];

  const book = initialize(
    {
      elementTagIdentifier: BookIdentifier,
      media,
      destroy: () => {
        book.remove();
        destroyCallbacks.forEach((callback) => callback());
      },
    },
    {
      ...config,
      classnames: [theme?.className],
      styles: {
        ...(config.styles ?? {}),
        ...bookStyles,
      },
      children: [LaminaComponent()],
    }
  );

  const goToPage = updateHandler(book, {
    get: getPage,
    pagesShown,
    elementConfig: merge<CreateElementConfig, CreateElementConfig>(
      {
        styles: {
          ...pageStyles,
        },
      },
      {
        classnames: [theme?.pageClassName],
      }
    ),
    animation,
    showPageNumbers,
  });

  const decrement = async () => {
    await goToPage(currentPage - pagesShown);
    currentPage -= pagesShown;
  };
  const increment = async () => {
    await goToPage(currentPage + pagesShown);
    currentPage += pagesShown;
  };

  destroyCallbacks.push(
    ...listeners.map((listener) => listener(book, [decrement, increment]))
  );

  goToPage(currentPage);

  return book;
};

export default BookComponent;

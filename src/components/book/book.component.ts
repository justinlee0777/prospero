import styles from './book.module.css';

import CreateElementConfig from '../../elements/create-element.config';
import GetPage from '../../get-page.interface';
import merge from '../../utils/merge.function';
import normalizePageStyles from '../../utils/normalize-page-styles.function';
import NullaryFn from '../../utils/nullary-fn.type';
import BookmarkComponent from '../bookmark/bookmark.component';
import LaminaComponent from '../lamina/lamina.component';
import LoadingIconComponent from '../loading-icon/loading-icon.component';
import PagePickerComponent from '../page-picker/page-picker.component';
import BookComponent from './book-element.interface';
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
    showBookmark,
    theme,
  } = bookConfig;

  let { currentPage } = bookConfig;

  let { pageStyles } = args;
  pageStyles = normalizePageStyles(pageStyles);
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

  const [bookStyles, calculatedPageStyles] = getBookStyles(
    pageStyles,
    userDefinedPageStyles,
    pagesShown
  );

  const destroyCallbacks = [];

  const lamina = LaminaComponent();

  const book = initialize(
    {
      media,
      prospero: {
        type: 'book',
        destroy: () => {
          book.remove();
          destroyCallbacks.forEach((callback) => callback());
        },
      },
    },
    merge(
      {
        classnames: [styles.book, theme?.className],
        styles: {
          ...(config.styles ?? {}),
          ...bookStyles,
        },
        children: [lamina],
      },
      config
    )
  );

  let goToPage = updateHandler(book, {
    get: getPage,
    pagesShown,
    elementConfig: merge<CreateElementConfig>(
      {
        styles: {
          ...calculatedPageStyles,
        },
      },
      {
        classnames: [theme?.pageClassName],
      }
    ),
    animation,
    showPageNumbers,
  });

  const decrement = () => updatePage(currentPage - pagesShown);
  const increment = () => updatePage(currentPage + pagesShown);

  destroyCallbacks.push(
    ...listeners.map((listener) => listener(book, [decrement, increment])),
    () => lamina.prospero.destroy()
  );

  const pageNumberUpdates: Array<(pageNumber: number) => void> = [];

  // Add page picker if configured
  if (bookConfig.showPagePicker) {
    const pagePicker = PagePickerComponent({
      classnames: [styles.bookPagePicker],
    });

    lamina.appendChild(pagePicker);

    // 'goToPage' is based off 0 while the client goes by 1. Therefore, offset by 1.
    pagePicker.onpagechange = async (pageNumber) => {
      const newPage = pageNumber - 1;
      if (newPage !== currentPage) {
        const pageChanged = await updatePage(newPage);

        const invalidClass = styles.bookPagePickerInvalid;

        if (!pageChanged) {
          pagePicker.classList.add(invalidClass);
        } else {
          pagePicker.classList.remove(invalidClass);
        }
      }
    };

    destroyCallbacks.push(() => pagePicker.prospero.destroy());
  }

  // Add bookmark if configured
  if (showBookmark) {
    const bookmarkStorage = showBookmark.storage;

    const bookmark = BookmarkComponent(bookmarkStorage, {
      classnames: [styles.bookBookmark],
    });

    /*
     * Used to prevent flashing content.
     * If the bookmark is retrieved before 1000 milliseconds, go to the bookmarked page.
     * If not, then go to the 0th page. It is acceptable for the request to complete after 1000ms.
     */
    const timeoutId = setTimeout(() => goToPage(currentPage), 1000);
    bookmark.onbookmarkretrieval = ({ pageNumber }) => {
      goToPage((currentPage = pageNumber));
      clearTimeout(timeoutId);
    };

    bookmark.pagenumber = currentPage;

    lamina.appendChild(bookmark);

    pageNumberUpdates.push((pageNumber) => (bookmark.pagenumber = pageNumber));

    destroyCallbacks.push(() => bookmark.prospero.destroy());
  } else {
    goToPage(currentPage);
  }

  return book;

  async function updatePage(pageNumber: number) {
    const oldPage = currentPage;

    const destroyLoadingIcon = addLoadingIcon(lamina);

    let pageChanged = false;

    try {
      pageChanged = await goToPage(pageNumber);
    } finally {
      destroyLoadingIcon();
    }

    if (!pageChanged) {
      currentPage = oldPage;
    } else {
      currentPage = pageNumber;
      pageNumberUpdates.forEach((update) => update(currentPage));
    }

    return pageChanged;
  }

  /**
   *
   * @returns destruction of loading icon.
   */
  function addLoadingIcon(parent: HTMLElement): NullaryFn {
    const loadingIcon = LoadingIconComponent({
      classnames: [styles.bookLoadingIcon],
    });

    parent.appendChild(loadingIcon);

    return () => loadingIcon.prospero.destroy();
  }
};

export default BookComponent;

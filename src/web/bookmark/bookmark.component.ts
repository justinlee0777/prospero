import styles from './bookmark.module.css';

import div from '../../elements/div.function';
import merge from '../../utils/merge.function';
import BookmarkElement from './bookmark-element.interface';
import CreateBookmarkElement from './create-bookmark-element.interface';

const BookmarkComponent: CreateBookmarkElement = (
  storage,
  elementConfig = {}
) => {
  const bookmarkContent = div({
    classnames: [styles.bookmarkContent],
  });

  const bookmark = div(
    merge(
      {
        classnames: [styles.bookmark],
        children: [bookmarkContent],
      },
      elementConfig
    )
  ) as unknown as BookmarkElement;

  bookmark.tabIndex = 0;

  async function saveBookmark(event: MouseEvent) {
    event.stopPropagation();

    const pageNumber = bookmark.pagenumber;

    if (pageNumber) {
      storage.save({
        pageNumber,
      });
      updatePageNumber();

      bookmark.classList.add(styles.bookmarkActivated);

      await new Promise((resolve) => setTimeout(resolve, 300));

      bookmark.classList.remove(styles.bookmarkActivated);
    }
  }

  bookmark.addEventListener('click', saveBookmark);

  function updatePageNumber(): void {
    // Page number is 0th based but the client is 1-based. Therefore offset by 1.
    bookmarkContent.textContent = (bookmark.pagenumber + 1).toString();
  }

  let onbookmarkretrieval: BookmarkElement['onbookmarkretrieval'];

  Object.defineProperty(bookmark, 'onbookmarkretrieval', {
    get(): BookmarkElement['onbookmarkretrieval'] {
      return onbookmarkretrieval;
    },
    set(callback: BookmarkElement['onbookmarkretrieval']) {
      onbookmarkretrieval = callback;

      if (bookmark.pagenumber) {
        onbookmarkretrieval?.({ pageNumber: bookmark.pagenumber });
      }
    },
  });

  bookmark.prospero = {
    type: 'bookmark',
    destroy: () => {
      bookmark.removeEventListener('click', saveBookmark);

      bookmark.remove();
    },
  };

  Promise.resolve(storage.get()).then((bookmarkData) => {
    if (bookmarkData) {
      const { pageNumber } = bookmarkData;
      bookmark.pagenumber = pageNumber;

      updatePageNumber();
      onbookmarkretrieval?.(bookmarkData);
    }
  });

  return bookmark;
};

export default BookmarkComponent;

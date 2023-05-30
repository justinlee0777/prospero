import div from '../../elements/div.function';
import NullaryFn from '../../utils/nullary-fn.type';
import BookElement from '../book/book-element.interface';
import BookIdentifier from '../book/book.symbol';
import MediaQueryListenerFactory from '../media-query/media-query-listener.factory';
import BooksElement from './books-element.interface';
import BooksIdentifier from './books.symbol';
import CreateBooksElement from './create-books-element.interface';

/**
 * Sets up media query listener based on the BookComponent added to it on initialization.
 * BookComponents without media are considered fallback. If multiple components do not have media, the first one is
 * chosen as fallback and the rest are discarded.
 * @throws if there is no fallback
 */
const BooksComponent: CreateBooksElement = (config) => {
  const children = config?.children ?? [];

  const books = children.filter(
    (child) =>
      'elementTagIdentifier' in child &&
      child.elementTagIdentifier === BookIdentifier
  ) as Array<BookElement>;

  const fallbacks = books.filter((book) => !Boolean(book.media));
  const [fallback, ...unusedFallbacks] = fallbacks;

  if (!fallback) {
    throw new Error(
      `BooksComponent could not be created. There must be one fallback Book (does not has a 'media' attribute defined).`
    );
  }

  // Hide unused books.
  unusedFallbacks.forEach((book) => {
    bookVisibilityState(book).hide();
  });

  const booksForSpecificMedia = books.filter((book) => Boolean(book.media));

  const renderedBooks = booksForSpecificMedia.map((book) => ({
    ...book.media,
    ...bookVisibilityState(book),
  }));

  const destroyMediaQueryListener = MediaQueryListenerFactory.create(
    bookVisibilityState(fallback),
    ...renderedBooks
  );

  const booksElement = div(config) as unknown as BooksElement;

  booksElement.elementTagIdentifier = BooksIdentifier;

  booksElement.destroy = () => {
    booksElement.remove();

    destroyMediaQueryListener();

    /** Destroy books for client. */
    books.forEach((book) => book.destroy());
  };

  return booksElement;
};

function bookVisibilityState(book: BookElement): {
  show: NullaryFn;
  hide: NullaryFn;
} {
  const fn = (state: boolean) => {
    book.style.display = state ? 'block' : 'none';
    book.ariaHidden = String(!state);
  };

  return {
    show: () => fn(true),
    hide: () => fn(false),
  };
}

export default BooksComponent;

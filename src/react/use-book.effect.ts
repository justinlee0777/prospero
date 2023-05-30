import { RefObject, useEffect } from 'react';

import BooksElement from '../components/books/books-element.interface';
import FlexibleBookElement from '../components/flexible-book/flexible-book-element.interface';

/**
 * A React hook that adds a Book to the page, in a specific place the user desires.
 * This has the caveat that if you want to place the Book in a specific place you have to add
 * an unnecessary <div>, which I think is an ok trade-off.
 *
 * A BookElement can be passed instead theoretically, using 'createBook' and 'deps' to handle media queries,
 * but I think best use case is to use BooksElement so long as that use case is sufficient.
 *
 * @param containerRef to append the book to.
 * @param createBook factory that creates Books or a FlexibleBook.
 * @param deps used in this hook e.g. in the 'createBook' factory.
 * @returns a function that destroys the book.
 */
export default function useBook(
  containerRef: RefObject<HTMLElement>,
  createBook: () => BooksElement | FlexibleBookElement,
  deps: Array<unknown> = []
): void {
  useEffect(() => {
    if (containerRef.current) {
      const book = createBook();

      containerRef.current.appendChild(book);

      return () => book.destroy();
    }
  }, [containerRef.current, ...deps]);
}

let mediaQueryBookList;
let mockDestroyMediaQueryListener;

jest.mock('../media-query/media-query-listener.factory', () => ({
  create(...args) {
    mediaQueryBookList = args;
    mockDestroyMediaQueryListener = jest.fn();
    return mockDestroyMediaQueryListener;
  },
}));

jest.mock('../../utils/merge.function', () => (arg) => arg);

import PagesOutput from '../../models/pages-output.interface';
import BookElement from '../book/book-element.interface';
import BookComponent from '../book/book.component';
import BooksComponent from './books.component';

describe('BooksComponent', () => {
  const pagesOutput: PagesOutput = {
    html: false,
    pages: ['Foo', 'Bar', 'Baz'],
    pageStyles: {
      width: 375,
      height: 667,
      computedFontFamily: 'Arial',
      computedFontSize: '16px',
      lineHeight: 24,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      border: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
  };

  test('creates Books with a Book', () => {
    const books = BooksComponent({
      children: [BookComponent(pagesOutput)],
    });

    expect(books).toBeTruthy();
    expect(mediaQueryBookList.length).toBe(1);

    mediaQueryBookList[0].show();

    const book = books.children.item(0) as BookElement;

    expect(book.ariaHidden).toBe('false');

    books.prospero.destroy();

    expect(mockDestroyMediaQueryListener).toHaveBeenCalledTimes(1);
  });

  test('creates Books with multiple Books', () => {
    const books = BooksComponent({
      children: [
        BookComponent(pagesOutput),
        BookComponent(pagesOutput),
        BookComponent(pagesOutput),
      ],
    });

    expect(books).toBeTruthy();
    // Only the first one is chosen, as all are equal.
    expect(mediaQueryBookList.length).toBe(1);

    mediaQueryBookList[0].show();

    const bookElements = [...books.children];

    expect(bookElements[0].ariaHidden).toBe('false');
    expect(bookElements[1].ariaHidden).toBe('true');
    expect(bookElements[2].ariaHidden).toBe('true');

    books.prospero.destroy();

    expect(mockDestroyMediaQueryListener).toHaveBeenCalledTimes(1);
  });

  test('creates Books with multiple Books for screen widths', () => {
    const books = BooksComponent({
      children: [
        BookComponent(pagesOutput),
        BookComponent(pagesOutput, { media: { minWidth: 600 } }),
        BookComponent(pagesOutput, { media: { minWidth: 1200 } }),
      ],
    });

    expect(books).toBeTruthy();
    expect(mediaQueryBookList.length).toBe(3);

    let bookElements = [...books.children];

    mediaQueryBookList.forEach((book) => book.hide());

    expect(bookElements[0].ariaHidden).toBe('true');
    expect(bookElements[1].ariaHidden).toBe('true');
    expect(bookElements[2].ariaHidden).toBe('true');

    mediaQueryBookList[0].show();

    bookElements = [...books.children];

    expect(bookElements[0].ariaHidden).toBe('false');
    expect(bookElements[1].ariaHidden).toBe('true');
    expect(bookElements[2].ariaHidden).toBe('true');

    mediaQueryBookList[1].show();

    bookElements = [...books.children];

    expect(bookElements[0].ariaHidden).toBe('false');
    expect(bookElements[1].ariaHidden).toBe('false');
    expect(bookElements[2].ariaHidden).toBe('true');

    mediaQueryBookList[2].show();

    bookElements = [...books.children];

    expect(bookElements[0].ariaHidden).toBe('false');
    expect(bookElements[1].ariaHidden).toBe('false');
    expect(bookElements[2].ariaHidden).toBe('false');

    books.prospero.destroy();

    expect(mockDestroyMediaQueryListener).toHaveBeenCalledTimes(1);
  });

  test('throws an error for Books with no Book', () => {
    expect(() => BooksComponent()).toThrowError(
      `BooksComponent could not be created. There must be one fallback Book (does not have a 'media' attribute defined).`
    );
  });

  test('throws an error for Books with a Book but no fallback', () => {
    expect(() =>
      BooksComponent({
        children: [BookComponent(pagesOutput, { media: { minWidth: 600 } })],
      })
    ).toThrowError(
      `BooksComponent could not be created. There must be one fallback Book (does not have a 'media' attribute defined).`
    );
  });
});

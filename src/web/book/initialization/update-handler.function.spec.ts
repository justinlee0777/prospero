jest.mock('../../../utils/merge.function', () => (arg) => arg);

import PagesOutput from '../../../models/pages-output.interface';
import DefaultPageFlipAnimation from '../animations/default-page-flip.animation';
import BookComponent from '../book.component';
import updateHandler from './update-handler.function';

describe('BookComponent updateHandler()', () => {
  const pages = ['foo', 'bar', 'baz'];

  const pagesOutput: PagesOutput = {
    pages,
    pageStyles: {
      width: 400,
      height: 600,
      computedFontFamily: 'Arial',
      computedFontSize: '16px',
      lineHeight: 32,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      padding: {
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

  test('updates one page', async () => {
    const book = BookComponent(pagesOutput);
    book.onpagechange = jest.fn();

    const callback = updateHandler(book, {
      animation: new DefaultPageFlipAnimation(),
      get: jest.fn().mockImplementation((pageNumber) => {
        if (pageNumber < 0 || pageNumber >= pages.length) {
          return null;
        } else {
          return pages[pageNumber];
        }
      }),
      pagesShown: 1,
      showPageNumbers: false,
    });

    expect(await callback(0)).toBe(true);

    await new Promise(jest.requireActual('timers').setImmediate);

    expect(book.children.length).toBe(2);

    expect(await callback(1)).toBe(true);
    expect(await callback(3)).toBe(false);

    expect(book.onpagechange).toHaveBeenCalledTimes(3);
  });

  test('updates two pages', async () => {
    const book = BookComponent(pagesOutput);
    book.onpagechange = jest.fn();

    const callback = updateHandler(book, {
      animation: new DefaultPageFlipAnimation(),
      get: jest.fn().mockImplementation((pageNumber) => {
        if (pageNumber < 0 || pageNumber >= pages.length) {
          return null;
        } else {
          return pages[pageNumber];
        }
      }),
      pagesShown: 2,
      showPageNumbers: false,
    });

    expect(await callback(0)).toBe(true);

    await new Promise(jest.requireActual('timers').setImmediate);

    expect(book.children.length).toBe(3);

    expect(await callback(1)).toBe(true);
    // Page 4 is valid even though it does not exist, as Page 3 exists.
    expect(await callback(3)).toBe(true);
    expect(await callback(4)).toBe(false);

    expect(book.onpagechange).toHaveBeenCalledTimes(4);
  });

  test('updates three pages', async () => {
    const book = BookComponent(pagesOutput);
    book.onpagechange = jest.fn();

    const callback = updateHandler(book, {
      animation: new DefaultPageFlipAnimation(),
      get: jest.fn().mockImplementation((pageNumber) => {
        if (pageNumber < 0 || pageNumber >= pages.length) {
          return null;
        } else {
          return pages[pageNumber];
        }
      }),
      pagesShown: 3,
      showPageNumbers: false,
    });

    expect(await callback(0)).toBe(true);

    await new Promise(jest.requireActual('timers').setImmediate);

    expect(book.children.length).toBe(4);

    expect(await callback(1)).toBe(true);
    expect(await callback(3)).toBe(false);

    expect(book.onpagechange).toHaveBeenCalledTimes(3);
  });

  test('takes null pages to mean the end of the book', async () => {
    const book = BookComponent(pagesOutput);

    let getRetVal: any;

    const callback = updateHandler(book, {
      animation: new DefaultPageFlipAnimation(),
      get: jest.fn().mockImplementation((pageNumber) => getRetVal),
      pagesShown: 3,
      showPageNumbers: false,
    });

    // Valid
    getRetVal = false;

    expect(await callback(0)).toBe(true);

    // Valid
    getRetVal = undefined;

    expect(await callback(0)).toBe(true);

    // Invalid
    getRetVal = null;

    expect(await callback(0)).toBe(false);
  });

  test('shows page numbers', async () => {
    const book = BookComponent(pagesOutput);
    book.onpagechange = jest.fn();

    const callback = updateHandler(book, {
      animation: new DefaultPageFlipAnimation(),
      get: jest.fn().mockImplementation((pageNumber) => {
        if (pageNumber < 0 || pageNumber >= pages.length) {
          return null;
        } else {
          return pages[pageNumber];
        }
      }),
      pagesShown: 1,
      showPageNumbers: true,
    });

    await callback(0);

    await new Promise(jest.requireActual('timers').setImmediate);

    const [page] = book.children;

    const pageNumberElement = page.querySelector('.pageNumber');
    expect(pageNumberElement).toBeTruthy();
    expect(pageNumberElement!.textContent).toBe('1');
  });
});

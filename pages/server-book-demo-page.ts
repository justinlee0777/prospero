import './book-demo.css';

import ServerPages from '../src/server-pages';
import {
  BookComponent,
  SinglePageBookAnimation,
  listenToClickEvents,
  listenToKeyboardEvents,
  listenToSwipeEvents,
} from '../src/web';
import DoublePageBookAnimation from '../src/web/book/animations/double-page-book.animation';
import BooksComponent from '../src/web/books/books.component';

window.addEventListener('DOMContentLoaded', async () => {
  const fontUrl = 'http://127.0.0.1:8080/Bookerly-Regular.ttf';
  const fontFace = new FontFace('Bookerly', `url(${fontUrl})`);

  document.fonts.add(fontFace);

  const endpointBase = 'http://127.0.0.1:9292/prospero/texts';

  const desktopPages = new ServerPages(`${endpointBase}/ulysses/desktop`);
  const desktopStyles = await desktopPages.getPageStyles();

  const desktopBook = BookComponent(
    {
      html: false,
      getPage: (pageNumber) => desktopPages.get(pageNumber),
      pageStyles: desktopStyles,
    },
    {
      animation: new DoublePageBookAnimation(),
      listeners: [listenToClickEvents, listenToKeyboardEvents],
      pagesShown: 2,
      media: {
        minWidth: 750,
      },
      showPagePicker: true,
      showBookmark: {
        storage: {
          get: () =>
            JSON.parse(localStorage.getItem('desktop-ulysses-bookmark')),
          save: (bookmark) =>
            localStorage.setItem(
              'desktop-ulysses-bookmark',
              JSON.stringify(bookmark)
            ),
        },
      },
    },
    {
      styles: { margin: 'auto' },
    }
  );

  const mobilePages = new ServerPages(`${endpointBase}/ulysses/mobile`);
  const mobileStyles = await mobilePages.getPageStyles();

  const mobileBook = BookComponent(
    {
      html: false,
      getPage: (pageNumber) => mobilePages.get(pageNumber),
      pageStyles: mobileStyles,
    },
    {
      animation: new SinglePageBookAnimation(),
      listeners: [listenToClickEvents, listenToSwipeEvents],
      pagesShown: 1,
      showPagePicker: true,
    },
    {
      styles: { margin: 'auto' },
    }
  );

  const books = BooksComponent({
    children: [mobileBook, desktopBook],
  });

  document.body.appendChild(books);
});

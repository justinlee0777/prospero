import './book-demo.css';

import {
  BookComponent,
  SinglePageBookAnimation,
  listenToClickEvents,
  listenToKeyboardEvents,
  listenToSwipeEvents,
} from '../src/components';
import DoublePageBookAnimation from '../src/components/book/animations/double-page-book.animation';
import BooksComponent from '../src/components/books/books.component';
import ServerPages from '../src/server-pages';

window.addEventListener('DOMContentLoaded', async () => {
  const fontUrl = 'http://127.0.0.1:8080/Bookerly-Regular.ttf';
  const fontFace = new FontFace('Bookerly', `url(${fontUrl})`);

  document.fonts.add(fontFace);

  const endpointBase = 'http://127.0.0.1:9292/prospero/texts';

  const desktopPages = new ServerPages(`${endpointBase}/ulysses/desktop`);
  const desktopStyles = await desktopPages.getPageStyles();

  const desktopBook = BookComponent(
    {
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
    },
    {
      styles: { margin: 'auto' },
    }
  );

  const mobilePages = new ServerPages(`${endpointBase}/ulysses/mobile`);
  const mobileStyles = await mobilePages.getPageStyles();

  const mobileBook = BookComponent(
    {
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

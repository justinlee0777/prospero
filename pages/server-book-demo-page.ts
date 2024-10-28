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
import LoadingScreenComponent from '../src/web/loading-screen/loading-screen.component';
import containerStyleConst from './container-style.const';

window.addEventListener('DOMContentLoaded', async () => {
  const fontUrl = 'http://127.0.0.1:3000/Bookerly-Regular.ttf';
  const fontFace = new FontFace('Bookerly', `url(${fontUrl})`);

  document.fonts.add(fontFace);

  const endpointBase = 'http://localhost:8080/api/prospero/texts';

  const desktopPages = new ServerPages(`${endpointBase}/ulysses/desktop/`);

  let loadingScreen = LoadingScreenComponent();

  document.body.appendChild(loadingScreen);

  const desktopStyles = await desktopPages.getPageStyles();

  document.body.removeChild(loadingScreen);

  const desktopBook = BookComponent(
    {
      getPage: (pageNumber) => desktopPages.get(pageNumber),
      pageStyles: desktopStyles,
    },
    {
      animation: new DoublePageBookAnimation(),
      listeners: [listenToClickEvents, listenToKeyboardEvents],
      loading: LoadingScreenComponent,
      pagesShown: 2,
      media: {
        minWidth: 750,
      },
      showPagePicker: true,
      showBookmark: {
        storage: {
          get: () =>
            JSON.parse(localStorage.getItem('desktop-ulysses-bookmark')!),
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

  const mobilePages = new ServerPages(`${endpointBase}/ulysses/mobile/`);

  loadingScreen = LoadingScreenComponent(
    {
      pageStyles: containerStyleConst,
    },
    {
      pagesShown: 2,
    },
    {
      styles: {
        margin: 'auto',
      },
    }
  );

  document.body.appendChild(loadingScreen);

  const mobileStyles = await mobilePages.getPageStyles();

  document.body.removeChild(loadingScreen);

  const mobileBook = BookComponent(
    {
      getPage: (pageNumber) => mobilePages.get(pageNumber),
      pageStyles: mobileStyles,
    },
    {
      animation: new SinglePageBookAnimation(),
      listeners: [listenToClickEvents, listenToSwipeEvents],
      loading: LoadingScreenComponent,
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

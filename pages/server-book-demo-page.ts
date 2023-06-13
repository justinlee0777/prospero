import './book-demo.css';

import {
  SinglePageBookAnimation,
  listenToClickEvents,
  listenToKeyboardEvents,
  listenToSwipeEvents,
} from '../src/components';
import Ariel from '../src/components/ariel/ariel.function';
import DoublePageBookAnimation from '../src/components/book/animations/double-page-book.animation';
import BooksComponent from '../src/components/books/books.component';

window.addEventListener('DOMContentLoaded', async () => {
  const fontUrl = 'http://127.0.0.1:8080/Bookerly-Regular.ttf';
  const fontFace = new FontFace('Bookerly', `url(${fontUrl})`);

  document.fonts.add(fontFace);

  const endpointBase = 'http://127.0.0.1:9292/prospero/texts';

  const desktopBook = await Ariel(
    `${endpointBase}/ulysses/desktop`,
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

  const mobileBook = await Ariel(
    `${endpointBase}/ulysses/mobile`,
    {
      animation: new SinglePageBookAnimation(),
      listeners: [listenToClickEvents, listenToSwipeEvents],
      pagesShown: 1,
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

import './book-demo.css';

import {
  DefaultBookThemeClassName,
  SinglePageBookAnimation,
  listenToClickEvents,
  listenToKeyboardEvents,
  listenToSwipeEvents,
} from '../src/components';
import DoublePageBookAnimation from '../src/components/book/animations/double-page-book.animation';
import connectBook from '../src/components/book/connect-book.function';
import BooksComponent from '../src/components/books/books.component';

window.addEventListener('DOMContentLoaded', async () => {
  const endpointBase = 'http://127.0.0.1:9292/prospero/texts';

  const desktopBook = await connectBook(`${endpointBase}/ulysses/desktop`, [
    {
      animation: new DoublePageBookAnimation(),
      listeners: [listenToClickEvents, listenToKeyboardEvents],
      pagesShown: 2,
      media: {
        minWidth: 750,
      },
    },
    {
      classnames: [DefaultBookThemeClassName],
      styles: { margin: 'auto' },
    },
  ]);

  const mobileBook = await connectBook(`${endpointBase}/ulysses/mobile`, [
    {
      animation: new SinglePageBookAnimation(),
      listeners: [listenToClickEvents, listenToSwipeEvents],
      pagesShown: 1,
    },
    {
      classnames: [DefaultBookThemeClassName],
      styles: { margin: 'auto' },
    },
  ]);

  const books = BooksComponent({
    children: [mobileBook, desktopBook],
  });

  document.body.appendChild(books);
});

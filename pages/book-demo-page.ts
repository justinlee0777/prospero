import './book-demo.css';

import {
  SinglePageBookAnimation,
  listenToClickEvents,
  listenToKeyboardEvents,
  listenToSwipeEvents,
} from '../src/web';
import DoublePageBookAnimation from '../src/web/book/animations/double-page-book.animation';
import BookComponent from '../src/web/book/book.component';
import BooksComponent from '../src/web/books/books.component';
import { getPages } from './get-pages.function';

window.addEventListener('DOMContentLoaded', async () => {
  const { desktop, mobile } = await getPages();

  const desktopBook = BookComponent(
    desktop,
    {
      pageStyles: {
        backgroundColor: '#f9d8a7',
      },
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

  const mobileBook = BookComponent(
    mobile,
    {
      pageStyles: {
        backgroundColor: '#f9d8a7',
      },
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

import './book-demo.css';

import {
  DefaultBookThemeClassName,
  SinglePageBookAnimation,
  listenToClickEvents,
  listenToKeyboardEvents,
  listenToSwipeEvents,
} from '../src/components';
import DoublePageBookAnimation from '../src/components/book/animations/double-page-book.animation';
import BookComponent from '../src/components/book/book.component';
import BooksComponent from '../src/components/books/books.component';
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
      classnames: [DefaultBookThemeClassName],
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
      classnames: [DefaultBookThemeClassName],
      styles: { margin: 'auto' },
    }
  );

  const books = BooksComponent({
    children: [mobileBook, desktopBook],
  });

  document.body.appendChild(books);
});

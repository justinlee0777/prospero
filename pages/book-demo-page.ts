import './book-demo.css';

import BookComponent from '../src/components/book/book.component';
import { getPages } from './get-pages.function';
import BooksComponent from '../src/components/books/books.component';

window.addEventListener('DOMContentLoaded', async () => {
  const { desktop, mobile } = await getPages();

  const desktopBook = BookComponent(
    desktop,
    {
      pageStyles: {
        backgroundColor: '#f9d8a7',
      },
      pagesShown: 2,
      media: {
        minWidth: 750,
      },
    },
    { styles: { margin: 'auto' } }
  );

  const mobileBook = BookComponent(
    mobile,
    {
      pageStyles: {
        backgroundColor: '#f9d8a7',
      },
      pagesShown: 1,
    },
    { styles: { margin: 'auto' } }
  );

  const books = BooksComponent({
    children: [mobileBook, desktopBook],
  });

  document.body.appendChild(books);
});

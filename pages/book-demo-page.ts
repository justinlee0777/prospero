import './book-demo.css';

import BookComponent from '../src/components/book/book.component';
import { MediaQueryListenerFactory } from '../src/components';
import { getPages } from './get-pages.function';

window.addEventListener('DOMContentLoaded', async () => {
  const pageData = await getPages();

  MediaQueryListenerFactory.create(
    () => console.log('fallback'),
    {
      minWidth: 500,
      callback: (minWidth) => console.log(minWidth, 'foo'),
    },
    {
      minWidth: 1200,
      callback: (minWidth) => console.log(minWidth, 'baz'),
    },
    {
      minWidth: 800,
      callback: (minWidth) => console.log(minWidth, 'bar'),
    }
  );

  const book = BookComponent(
    pageData,
    {
      pageStyles: {
        backgroundColor: '#f9d8a7',
      },
      pagesShown: 2,
    },
    { styles: { margin: 'auto' } }
  );

  document.body.appendChild(book);
});

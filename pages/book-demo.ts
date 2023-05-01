import './book-demo.css';

import BookComponent from '../src/components/book/book.component';
import Pages from '../src/pages';
import getTextSample from './get-text-sample.function';
import containerStyles from './container-style.const';
import processors from './processors.const';
import { MediaQueryListenerFactory } from '../src/components';

window.addEventListener('DOMContentLoaded', async () => {
  const text = await getTextSample();

  const pages = new Pages(containerStyles, text, processors);

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
    {
      getPage: (pageNumber) => pages.get(pageNumber),
      containerStyles,
    },
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

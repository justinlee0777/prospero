import './book-demo.css';

import BookComponent from '../src/components/book/book.component';
import Pages from '../src/pages';
import getTextSample from './get-text-sample.function';
import containerStyles from './container-style.const';
import processors from './processors.const';

window.addEventListener('DOMContentLoaded', async () => {
  const text = await getTextSample();

  const pages = new Pages(containerStyles, text, processors);

  const book = BookComponent(
    {
      getPage: (pageNumber) => pages.get(pageNumber),
      containerStyles,
      pageStyles: {
        backgroundColor: '#f9d8a7',
      },
      pagesShown: 3,
    },
    { styles: { margin: 'auto' } }
  );

  document.body.appendChild(book);
});

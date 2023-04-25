import './book-demo.css';

import BookComponent from '../src/components/book/book.component';
import PageLayout from '../src/components/book/page-layout.enum';
import Pages from '../src/pages';
import getTextSample from './get-text-sample.function';
import containerStyles from './container-style.const';

window.addEventListener('DOMContentLoaded', async () => {
  const text = await getTextSample();

  const pages = new Pages(containerStyles, text);

  const book = BookComponent(
    {
      getPage: (pageNumber) => pages.get(pageNumber),
      containerStyles,
      // pageLayout: PageLayout.DOUBLE,
    },
    { styles: { margin: 'auto' } }
  );

  document.body.appendChild(book);
});

import './book-demo.css';

import BookComponent from '../src/components/book/book.component';
import ContainerStyle from '../src/container-style.interface';
import PageLayout from '../src/components/book/page-layout.enum';
import Pages from '../src/pages';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/proteus.txt');
  const text = await response.text();

  const containerStyles: ContainerStyle = {
    width: 375,
    height: 667,
    computedFontFamily: 'Arial',
    computedFontSize: '16px',
    lineHeight: 24,
    padding: {
      top: 24,
      right: 24,
      bottom: 24,
      left: 24,
    },
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    border: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    textIndent: '     ',
  };

  const pages = new Pages(containerStyles, text);

  const book = BookComponent(
    {
      getPage: (pageNumber) => pages.get(pageNumber),
      containerStyles,
      pageLayout: PageLayout.DOUBLE,
    },
    { styles: { margin: 'auto' } }
  );

  document.body.appendChild(book);
});

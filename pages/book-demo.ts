import './book-demo.css';

import buildPagesByGenerator from '../src/build-pages-by-generator.function';
import getTextContent from '../src/get-text-content.function';
import Book from '../src/components/book/book.component';
import ContainerStyle from '../src/container-style.interface';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/ping.txt');
  const text = await response.text();

  const containerStyles: ContainerStyle = {
    width: window.innerWidth,
    height: window.innerHeight,
    computedFontFamily: 'Arial',
    computedFontSize: '16px',
    lineHeight: 32,
    padding: {
      top: 18,
      right: 18,
      bottom: 18,
      left: 18,
    },
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    border: {
      top: 1,
      right: 1,
      bottom: 1,
      left: 1,
    },
  };

  const getPage = buildPagesByGenerator(getTextContent(containerStyles, text));

  const book = Book({ getPage, containerStyles });

  document.body.appendChild(book);
});

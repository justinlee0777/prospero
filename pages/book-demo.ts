import './index.css';

import toPixelUnits from '../src/utils/to-pixel-units.function';
import getTextContent from '../src/get-text-content.function';
import div from '../src/elements/div.function';
import createKeydownListener from '../src/elements/create-keydown-listener.function';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/ping.txt');
  const text = await response.text();

  const container = div({
    classnames: ['book', 'animated'],
  });
  container.classList.add('book');

  document.body.append(container);

  const style = window.getComputedStyle(container);

  const pageWidth = window.innerWidth;
  const pageHeight = window.innerHeight;

  const generator = getTextContent(
    {
      width: window.innerWidth,
      padding: {
        left: 18,
        right: 18,
      },
      margin: {
        left: 1,
        right: 1,
      },
    },
    text,
    [
      pageHeight,
      toPixelUnits(style.lineHeight),
      {
        top: 18,
        bottom: 18,
      },
      {
        top: 1,
        bottom: 1,
      },
    ],
    [style.fontSize, style.fontFamily]
  );

  let result: IteratorResult<string> = generator.next();

  let currentPage = 0;
  const cachedPages = [result.value];

  const page = div({
    textContent: result.value,
    classnames: ['page'],
    styles: {
      height: `${pageHeight}px`,
      width: `${pageWidth}px`,
    },
  });

  window.addEventListener(
    'keydown',
    createKeydownListener({
      ArrowRight: () => {
        let textContent: string;

        if (currentPage === cachedPages.length - 1) {
          result = generator.next();

          if (!result.done) {
            currentPage++;
            textContent = cachedPages[currentPage] = result.value;
          }
        } else {
          currentPage++;
          textContent = cachedPages[currentPage];
        }

        textContent && (page.textContent = textContent);
      },
      ArrowLeft: () => {
        if (currentPage !== 0) {
          currentPage--;
          page.textContent = cachedPages[currentPage];
        }
      },
    })
  );

  container.append(page);
});

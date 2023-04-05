import './index.css';

import toPixelUnits from '../src/utils/to-pixel-units.function';
import getTextContent from '../src/get-text-content.function';
import div from '../src/elements/div.function';
import createKeydownListener from '../src/elements/create-keydown-listener.function';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/ping.txt');
  const text = await response.text();

  const container = div({
    classnames: ['book', 'root', 'animated'],
  });

  document.body.classList.add('reset');
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

  function createPage(textContent: string): HTMLDivElement {
    return div({
      textContent,
      classnames: ['page', 'animated'],
      styles: {
        height: `${pageHeight}px`,
        width: `${pageWidth}px`,
      },
    });
  }

  let page: HTMLDivElement = createPage(result.value);

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

        if (textContent) {
          const newPage = createPage(textContent);

          container.prepend(newPage);

          const oldPage = page;
          page = newPage;
          oldPage
            .animate(
              {
                transform: [
                  'skewY(0) translateX(0) scaleX(1)',
                  'skewY(-30deg) translateX(-100%) scaleX(.5)',
                ],
              },
              600
            )
            .finished.then(() => {
              container.removeChild(oldPage);
            });
        }
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

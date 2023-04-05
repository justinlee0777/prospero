import './book-demo.css';

import div from '../src/elements/div.function';
import createKeydownListener from '../src/elements/create-keydown-listener.function';
import getTextContentByPageElement from '../src/get-text-content-by-page-element.function';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/ping.txt');
  const text = await response.text();

  function createPage(textContent?: string): HTMLDivElement {
    return div({
      textContent,
      classnames: ['page'],
    });
  }

  let page: HTMLDivElement = createPage();

  const container = div({
    classnames: ['book'],
    children: [page],
  });

  document.body.append(container);

  const generator = getTextContentByPageElement(page, text);

  let result: IteratorResult<string> = generator.next();

  page.textContent = result.value;

  let currentPage = 0;
  const cachedPages = [result.value];

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

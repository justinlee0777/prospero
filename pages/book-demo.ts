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

  const getPage = buildPagesByGenerator(
    getTextContentByPageElement(page, text)
  );

  page.textContent = getPage(0);

  let currentPage = 0;

  window.addEventListener(
    'keydown',
    createKeydownListener({
      ArrowRight: () => {
        const textContent = getPage(currentPage + 1);

        if (textContent) {
          currentPage++;

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
          page.textContent = getPage(--currentPage);
        }
      },
    })
  );

  container.append(page);
});

function buildPagesByGenerator(
  generator: Generator<string>
): (pageNumber: number) => string | null {
  const cachedPages: Array<string> = [];
  let result: IteratorResult<string>;

  /**
   * @returns the text content for the given page number, or null if we have reached the end of pages.
   */
  return function getPage(pageNumber: number): string | null {
    const difference = pageNumber - (cachedPages.length - 1);

    if (difference < 0) {
      return cachedPages[pageNumber];
    } else if (result?.done) {
      return cachedPages[pageNumber] || null;
    } else {
      const newPages = [];
      let i = 0;

      while (i < difference) {
        result = generator.next();

        if (result.done) {
          break;
        } else {
          newPages.push(result.value);
          i++;
        }
      }

      cachedPages.push(...newPages);

      return cachedPages[pageNumber] || null;
    }
  };
}

import './index.css';

import getTextContent from '../src/get-text-content.function';
import toPixelUnits from '../src/utils/to-pixel-units.function';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/ping.txt');
  const text = await response.text();

  const container = document.body;
  container.classList.add('book');

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

  let result: IteratorResult<string>;

  while (!(result = generator.next()).done) {
    const page = document.createElement('div');
    page.classList.add('page');
    page.style.height = `${pageHeight}px`;
    page.style.width = `${pageWidth}px`;

    page.textContent = result.value;

    container.append(page);
  }
});

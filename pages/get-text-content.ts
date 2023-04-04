import './index.css';

import getTextContent from '../src/get-text-content.function';
import debounce from '../src/utils/debounce.function';
import toPixelUnits from '../src/utils/to-pixel-units.function';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/lorem-ipsum.txt');
  const text = await response.text();

  const container = document.body;
  container.style.maxHeight = '100vh';
  container.style.padding = '18px';

  function updateTextContent() {
    const style = window.getComputedStyle(container);

    container.textContent = getTextContent(
      {
        width: window.innerWidth,
        padding: {
          left: toPixelUnits(style.paddingLeft),
          right: toPixelUnits(style.paddingRight),
        },
      },
      text,
      [
        window.innerHeight,
        toPixelUnits(style.lineHeight),
        {
          top: toPixelUnits(style.paddingTop),
          bottom: toPixelUnits(style.paddingBottom),
        },
      ],
      [style.fontSize, style.fontFamily]
    ).next().value;
  }

  window.addEventListener('resize', debounce(updateTextContent), {
    passive: true,
  });

  updateTextContent();
});

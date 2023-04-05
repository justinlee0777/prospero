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
        height: window.innerHeight,
        lineHeight: toPixelUnits(style.lineHeight),
        computedFontSize: style.fontSize,
        computedFontFamily: style.fontFamily,
        padding: {
          left: toPixelUnits(style.paddingLeft),
          right: toPixelUnits(style.paddingRight),
          top: toPixelUnits(style.paddingTop),
          bottom: toPixelUnits(style.paddingBottom),
        },
        margin: {
          left: toPixelUnits(style.marginLeft),
          right: toPixelUnits(style.marginRight),
          top: toPixelUnits(style.marginTop),
          bottom: toPixelUnits(style.marginBottom),
        },
      },
      text
    ).next().value;
  }

  window.addEventListener('resize', debounce(updateTextContent), {
    passive: true,
  });

  updateTextContent();
});

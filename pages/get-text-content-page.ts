import './index.css';

import PageStyles from '../src/page-styles.interface';
import Pages from '../src/pages';
import debounce from '../src/utils/debounce.function';
import toPixelUnits from '../src/utils/to-pixel-units.function';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/proteus.txt');
  const text = await response.text();

  const container = document.body;
  container.style.maxHeight = '100vh';
  container.style.padding = '18px';

  async function updateTextContent() {
    const style = window.getComputedStyle(container);

    const containerStyle: PageStyles = {
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
      border: {
        top: toPixelUnits(style.borderTopWidth),
        right: toPixelUnits(style.borderRightWidth),
        bottom: toPixelUnits(style.borderBottomWidth),
        left: toPixelUnits(style.borderLeftWidth),
      },
    };

    const pages = new Pages(containerStyle, text);

    container.textContent = await pages.get(0);
  }

  window.addEventListener('resize', debounce(updateTextContent), {
    passive: true,
  });

  updateTextContent();
});

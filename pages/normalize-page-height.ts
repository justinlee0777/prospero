import './index.css';

import getNormalizedPageHeight from '../src/get-normalized-page-height.function';
import debounce from '../src/utils/debounce.function';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/tempest.txt');
  const text = await response.text();

  const container = document.body;
  const styles = window.getComputedStyle(container);
  const lineHeightInPixels = Number(styles.lineHeight.replace(/[A-Z]/gi, ''));

  const updatePageHeight = (() => {
    let cachedHeight: number | undefined;

    return () => {
      const pageHeight = getNormalizedPageHeight(
        window.innerHeight,
        lineHeightInPixels
      );

      if (cachedHeight !== pageHeight) {
        container.style.maxHeight = `${pageHeight}px`;
      }
      cachedHeight = pageHeight;
    };
  })();

  container.textContent = text;

  window.addEventListener('resize', debounce(updatePageHeight), {
    passive: true,
  });

  updatePageHeight();
});

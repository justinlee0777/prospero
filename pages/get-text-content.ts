import './index.css';

import getTextContent from '../src/get-text-content.function';
import debounce from '../src/utils/debounce.function';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/lorem-ipsum.txt');
  const text = await response.text();

  const container = document.body;

  function updateTextContent() {
    const style = window.getComputedStyle(container);

    container.textContent = getTextContent(
      window.innerWidth,
      text,
      [window.innerHeight, Number(style.lineHeight.replace(/[A-Z]/gi, ''))],
      [style.fontSize, style.fontFamily]
    );
  }

  window.addEventListener('resize', debounce(updateTextContent), {
    passive: true,
  });

  updateTextContent();
});

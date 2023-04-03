import './index.css';

import PageHeight from './src/page-height';
import debounce from './src/utils/debounce.function';
import getViewportHeight from './src/utils/get-viewport-height.function';

async function loadText(): Promise<void> {
  const response = await fetch('./tempest.txt');
  const text = await response.text();

  const fontSize = 16;
  const lineHeight = 2;

  const container = document.body;
  container.style.fontSize = `${fontSize}px`;
  container.style.lineHeight = lineHeight.toString();

  const pageHeight = new PageHeight(container);

  container.textContent = text;

  const updateHeight = () => pageHeight.set(getViewportHeight());

  window.addEventListener('resize', debounce(updateHeight), { passive: true });

  updateHeight();
}

loadText();

import './index.css';

import getCharacterWidths from '../src/get-character-widths.function';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.body;

  const styles = window.getComputedStyle(container);

  const characterToWidths = getCharacterWidths(
    styles.fontSize,
    styles.fontFamily
  );

  for (const [character, width] of characterToWidths) {
    const p = document.createElement('p');
    const characterElement = document.createElement('b');
    const widthElement = document.createElement('b');

    characterElement.textContent = character;
    widthElement.textContent = `${width}px`;

    p.appendChild(characterElement);
    p.innerHTML += ' : ';
    p.appendChild(widthElement);

    container.append(p);
  }
});

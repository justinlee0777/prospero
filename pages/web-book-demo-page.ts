import './book-demo.css';

import {
  IndentTransformer,
  NewlineTransformer,
} from '../src/transformers/public-api';
import { listenToClickEvents, listenToKeyboardEvents } from '../src/web';
import FlexibleBookComponent from '../src/web/flexible-book/flexible-book.component';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('./color-example.txt');
  const text = await response.text();

  const container = document.body;

  const flexibleBook = FlexibleBookComponent(
    {
      text,
      pageStyles: {
        computedFontFamily: 'Arial',
        computedFontSize: '16px',
        lineHeight: 32,
        padding: {
          top: 36,
          right: 18,
          bottom: 36,
          left: 18,
        },
      },
      mediaQueryList: [
        {
          pagesShown: 1,
          listeners: [listenToClickEvents],
        },
        {
          pattern: {
            minWidth: 800,
          },
          config: {
            pagesShown: 2,
            listeners: [listenToClickEvents, listenToKeyboardEvents],
            showPagePicker: true,
            showBookmark: {
              storage: {
                get: () => JSON.parse(localStorage.getItem('proteus-bookmark')),
                save: (bookmark) =>
                  localStorage.setItem(
                    'proteus-bookmark',
                    JSON.stringify(bookmark)
                  ),
              },
            },
          },
        },
      ],
    },
    {
      transformers: [
        // new IndentTransformer(5),
        // new NewlineTransformer({ beginningSections: 4, betweenParagraphs: 0 }),
      ],
      forHTML: {
        hrString: '-',
      },
    },
    {
      styles: {
        width: '80vw',
        height: '90vh',
        maxWidth: '1200px',
        margin: 'auto',
      },
    }
  );

  container.append(flexibleBook);
});

import './book-demo.css';

import FlexibleBookComponent from '../src/components/flexible-book/flexible-book.component';
import {
  IndentTransformer,
  NewlineTransformer,
} from '../src/transformers/public-api';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/ulysses/proteus.txt');
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
        },
        {
          pattern: {
            minWidth: 800,
          },
          config: {
            pagesShown: 2,
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
        new IndentTransformer(5),
        new NewlineTransformer({ beginningSections: 4, betweenParagraphs: 0 }),
      ],
      forHTML: true,
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

import './book-demo.css';

import DoublePageBookPreset from '../src/components/book/presets/double-page-book-preset.const';
import SinglePageBookPreset from '../src/components/book/presets/single-page-book-preset.const';
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
        SinglePageBookPreset(),
        {
          pattern: {
            minWidth: 800,
          },
          config: {
            ...DoublePageBookPreset(),
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

import './book-demo.css';

import DoublePageBookPreset from '../src/components/book/presets/double-page-book-preset.const';
import SinglePageBookPreset from '../src/components/book/presets/single-page-book-preset.const';
import FlexibleBookComponent from '../src/components/flexible-book/flexible-book.component';
import { HTMLProcessor, IndentProcessor } from '../src/shared';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/proteus.txt');
  const text = await response.text();

  const container = document.body;

  const flexibleBook = FlexibleBookComponent(
    {
      text,
      containerStyle: {
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
          config: DoublePageBookPreset(),
        },
      ],
    },
    {
      createProcessors: () => [new HTMLProcessor(), new IndentProcessor(5)],
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

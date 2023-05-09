import './book-demo.css';

import {
  SinglePageBookAnimation,
  listenToClickEvents,
  listenToKeyboardEvents,
} from '../src/components';
import DoublePageBookAnimation from '../src/components/book/animations/double-page-book.animation';
import FlexibleBookComponent from '../src/components/flexible-book/flexible-book.component';
import { HTMLProcessor } from '../src/shared';

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('../text-samples/color-example.txt');
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
          right: 8,
          bottom: 36,
          left: 8,
        },
      },
      mediaQueryList: [
        {
          pagesShown: 1,
          animation: new SinglePageBookAnimation(),
          listeners: [listenToClickEvents],
        },
        {
          pattern: {
            minWidth: 800,
          },
          config: {
            pagesShown: 2,
            animation: new DoublePageBookAnimation(),
            listeners: [listenToClickEvents, listenToKeyboardEvents],
          },
        },
      ],
    },
    {
      createProcessors: () => [new HTMLProcessor()],
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

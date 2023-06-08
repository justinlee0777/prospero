import { useRef } from 'react';
import { createRoot } from 'react-dom/client';

import {
  BookComponent,
  BooksComponent,
  SinglePageBookAnimation,
  listenToClickEvents,
  listenToKeyboardEvents,
  listenToSwipeEvents,
} from '../src/components';
import DoublePageBookAnimation from '../src/components/book/animations/double-page-book.animation';
import useBook from '../src/react/use-book.effect';
import { getPages } from './get-pages.function';

const { desktop, mobile } = await getPages();

function ReactTest(): JSX.Element {
  const containerRef = useRef(null);

  useBook(containerRef, () =>
    BooksComponent({
      children: [
        BookComponent(
          desktop,
          {
            animation: new DoublePageBookAnimation(),
            listeners: [listenToClickEvents, listenToKeyboardEvents],
            pagesShown: 2,
            media: {
              minWidth: 750,
            },
          },
          {
            styles: { margin: 'auto' },
          }
        ),
        BookComponent(
          mobile,
          {
            animation: new SinglePageBookAnimation(),
            listeners: [listenToClickEvents, listenToSwipeEvents],
            pagesShown: 1,
          },
          {
            styles: { margin: 'auto' },
          }
        ),
      ],
    })
  );

  return <div ref={containerRef} />;
}

const root = createRoot(document.body);

root.render(<ReactTest />);

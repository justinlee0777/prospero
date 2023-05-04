import createKeydownListener from '../../../elements/create-keydown-listener.function';
import NullaryFn from '../../../utils/nullary-fn.type';
import BookElement from '../book-element.interface';

/**
 * @returns a no-args function that destroys the listener.
 */
export default function listenToKeyboardEvents(
  book: BookElement,
  [decrement, increment]: [NullaryFn, NullaryFn]
): NullaryFn {
  const keydownListener = createKeydownListener({
    ArrowRight: increment,
    ArrowDown: increment,
    ArrowLeft: decrement,
    ArrowUp: decrement,
  });

  book.addEventListener('keydown', keydownListener);

  return () => book.removeEventListener('keydown', keydownListener);
}

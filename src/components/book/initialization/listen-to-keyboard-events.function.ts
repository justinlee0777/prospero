import createKeydownListener from '../../../elements/create-keydown-listener.function';
import NullaryFn from '../../../utils/nullary-fn.type';
import BookComponent from '../book.component';

/**
 * @returns a no-args function that destroys the listener.
 */
export default function listenToKeyboardEvents(
  book: BookComponent,
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

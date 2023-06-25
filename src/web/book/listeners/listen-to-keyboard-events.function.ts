import createKeydownListener from '../../../elements/create-keydown-listener.function';
import AddListeners from '../../model/add-listeners.interface';

/**
 * @returns a no-args function that destroys the listener.
 */
const listenToKeyboardEvents: AddListeners = (book, [decrement, increment]) => {
  const keydownListener = createKeydownListener({
    ArrowRight: increment,
    ArrowDown: increment,
    ArrowLeft: decrement,
    ArrowUp: decrement,
  });

  book.addEventListener('keydown', keydownListener);

  return () => book.removeEventListener('keydown', keydownListener);
};

export default listenToKeyboardEvents;

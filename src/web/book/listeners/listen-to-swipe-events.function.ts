import registerSwipeListener from '../../../elements/register-swipe-listener.function';
import SwipeDirection from '../../../elements/swipe-direction.enum';
import AddListeners from '../../model/add-listeners.interface';
import lockElement from './lock-element.function';

/**
 * @returns a no-args function that destroys the listener.
 */
const listenToSwipeEvents: AddListeners = (book, [decrement, increment]) => {
  const destroyLock = lockElement(book);

  const destroySwipeListener = registerSwipeListener(book, ([direction]) => {
    switch (direction) {
      case SwipeDirection.UP:
        return decrement();
      case SwipeDirection.RIGHT:
        return increment();
      case SwipeDirection.DOWN:
        return increment();
      case SwipeDirection.LEFT:
        return decrement();
    }
  });

  return () => {
    destroyLock();
    destroySwipeListener();
  };
};

export default listenToSwipeEvents;

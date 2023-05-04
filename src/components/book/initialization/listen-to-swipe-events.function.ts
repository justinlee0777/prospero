import registerSwipeListener from '../../../elements/register-swipe-listener.function';
import SwipeDirection from '../../../elements/swipe-direction.enum';
import NullaryFn from '../../../utils/nullary-fn.type';
import BookElement from '../book-element.interface';

/**
 * @returns a no-args function that destroys the listener.
 */
export default function listenToSwipeEvents(
  book: BookElement,
  [decrement, increment]: [NullaryFn, NullaryFn]
): NullaryFn {
  return registerSwipeListener(book, ([direction]) => {
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
}

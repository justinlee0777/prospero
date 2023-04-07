import SwipeDirection from './swipe-direction.enum';

interface SwipeListener {
  /**
   * @params swipeDirections indicating the direction the user swiped in. It is ordered by intensity, most to least.
   */
  (swipeDirections: Array<SwipeDirection>): void;
}

/**
 * @params sensitivity to determine how much movement on the screen the swipe needs to show before calling.
 * @returns a callback that destroys the listeners.
 */
export default function registerSwipeListener(
  element: HTMLElement,
  listener: SwipeListener,
  sensitivity = 100
): () => void {
  let stopIO: () => void;
  let removeEventListener: () => void;

  const stopIOSymbol = Symbol('Valid termination of IO.');
  const createStopIO = (reject: Function) => () => reject(stopIOSymbol);

  function destroy(): void {
    stopIO?.();
    removeEventListener?.();
  }

  async function listenForSwipeEvents() {
    while (true) {
      try {
        const touchstartEvent = await new Promise<{
          initialX: number;
          initialY: number;
        }>((resolve, reject) => {
          const listenForTouchstart = (event: TouchEvent) => {
            const { clientX, clientY } = event.changedTouches[0];

            resolve({ initialX: clientX, initialY: clientY });
          };

          stopIO = createStopIO(reject);
          removeEventListener = () =>
            element.removeEventListener('touchstart', listenForTouchstart);

          element.addEventListener('touchstart', listenForTouchstart, {
            once: true,
            passive: true,
          });
        });

        await new Promise<void>((resolve, reject) => {
          const listenForTouchend = (event: TouchEvent) => {
            const { initialX, initialY } = touchstartEvent;
            const { clientX, clientY } = event.changedTouches[0];

            const diffX = clientX - initialX;
            const diffY = clientY - initialY;

            let swipeDirections = Array(2);

            if (diffX > sensitivity) {
              swipeDirections[0] = SwipeDirection.LEFT;
            } else if (diffX < -sensitivity) {
              swipeDirections[0] = SwipeDirection.RIGHT;
            }

            if (diffY > sensitivity) {
              swipeDirections[1] = SwipeDirection.UP;
            } else if (diffY < -sensitivity) {
              swipeDirections[1] = SwipeDirection.DOWN;
            }

            if (Math.abs(diffY) > Math.abs(diffX)) {
              swipeDirections = swipeDirections.reverse();
            }

            // Ensure directions are truthy.
            swipeDirections = swipeDirections.filter((direction) =>
              Boolean(direction)
            );

            listener(swipeDirections);

            resolve();
          };

          stopIO = createStopIO(reject);
          removeEventListener = () =>
            element.removeEventListener('touchend', listenForTouchend);

          element.addEventListener('touchend', listenForTouchend, {
            once: true,
            passive: true,
          });
        });
      } catch (error) {
        if (error === stopIOSymbol) {
          break;
        } else {
          // Otherwise, recycle the genuinely unhandled error and terminate IO.
          throw error;
        }
      }
    }
  }

  listenForSwipeEvents();

  return destroy;
}

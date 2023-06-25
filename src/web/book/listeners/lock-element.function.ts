import NullaryFn from '../../../utils/nullary-fn.type';

export default function lockElement(book: HTMLElement): NullaryFn {
  let destroy: NullaryFn;

  (async function () {
    async function listenTo(event: keyof HTMLElementEventMap) {
      return new Promise((resolve, reject) => {
        book.addEventListener(event, resolve, { once: true });
        destroy = reject;
      });
    }

    let reset: NullaryFn;

    function stopScrolling(): void {
      const originalTouchAction = book.style.touchAction;
      book.style.touchAction = 'pinch-zoom';

      reset = () => (book.style.touchAction = originalTouchAction);
    }

    try {
      while (true) {
        await listenTo('focus');

        stopScrolling();

        await listenTo('blur');

        reset();
      }
    } catch {
      reset?.();
    }
  })();

  return () => destroy?.();
}

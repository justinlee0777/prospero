import { nextTick } from 'process';

import div from '../../../elements/div.function';
import NullaryFn from '../../../utils/nullary-fn.type';
import lockElement from './lock-element.function';

describe('BookComponent lockElement()', () => {
  let book: HTMLElement;
  let destroyFn: NullaryFn | undefined;

  beforeEach(() => {
    destroyFn = undefined;

    book = div();

    window.document.body.appendChild(book);
  });

  afterEach(() => {
    destroyFn?.();
  });

  test('stops scrolling when the element is focused', async () => {
    destroyFn = lockElement(book);

    expect(book.style.touchAction).toBeUndefined();

    book.dispatchEvent(new Event('focus'));

    await new Promise(nextTick);

    expect(book.style.touchAction).toBe('pinch-zoom');
  });

  test('allows scrolling when the element is blurred', async () => {
    destroyFn = lockElement(book);

    expect(book.style.touchAction).toBeUndefined();

    book.dispatchEvent(new Event('focus'));

    await new Promise(nextTick);

    expect(book.style.touchAction).toBe('pinch-zoom');

    book.dispatchEvent(new Event('blur'));

    await new Promise(nextTick);

    expect(book.style.touchAction).toBeUndefined();
  });

  test('destroys the listener appropriately', async () => {
    destroyFn = lockElement(book);

    book.dispatchEvent(new Event('focus'));

    await new Promise(nextTick);

    destroyFn();

    await new Promise(nextTick);

    expect(book.style.touchAction).toBeUndefined();
  });
});

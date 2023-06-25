import NullaryFn from '../../utils/nullary-fn.type';

/**
 * For adding behavior for user interactions on Books.
 */
export default interface AddListeners {
  /**
   * @returns the listener's destroyer.
   */
  (
    book: HTMLElement,
    [decrement, increment]: [NullaryFn, NullaryFn]
  ): NullaryFn;
}

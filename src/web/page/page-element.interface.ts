export default interface PageElement extends HTMLElement {
  /**
   * Removes the page from the book.
   */
  destroy(): void;
}

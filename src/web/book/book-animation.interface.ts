import PageElement from '../page/page-element.interface';
import BookElement from './book-element.interface';

export interface BookAnimationInit {
  pageNumber: number;
}

/**
 * Contract for book animations.
 * TBH, not sure how composing different animations will work in the future.
 */
export default interface BookAnimation {
  /**
   * Animate changing the page.
   * The method needs to handle removing the pages from the DOM, as the module may need
   * that much power for its animations.
   * @param book element for adding/removing elements.
   * @param pageNumber being changed to.
   * @param oldPages elements that need to be deleted by the end of the method.
   * @param newPages elements that have not been added yet and need to be.
   */
  changePage(
    book: BookElement,
    pageNumber: number,
    oldPages: Array<PageElement>,
    newPages: Array<PageElement>
  ): Promise<void>;

  /**
   * Supplies the animation with initial state, such as page number. This is useful if
   * the animation is stateful ex. directional.
   */
  initialize(config: BookAnimationInit): void;
}

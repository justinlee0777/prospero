import styles from './single-page-book-animation.module.css';

import PageElement from '../../page/page-element.interface';
import BookAnimation from '../book-animation.interface';
import BookElement from '../book-element.interface';

interface Config {
  milliseconds: number;
}

/**
 * Animation for single-paged books.
 */
export default class SinglePageBookAnimation implements BookAnimation {
  private milliseconds: number;
  private pageNumber = 0;

  constructor({ milliseconds }: Config = { milliseconds: 600 }) {
    this.milliseconds = milliseconds;
  }

  async changePage(
    book: BookElement,
    pageNumber: number,
    oldPages: Array<PageElement>,
    [page]: [PageElement]
  ): Promise<void> {
    // Underlay the page beneath existing pages.
    book.prepend(page);

    // Initial state of the animated page.
    const transform = ['skewY(0) translateX(0) scaleX(1)'];

    if (this.pageNumber < pageNumber) {
      // If the page number is greater, slant and animate the page left as if someone were pulling it.
      transform.push('skewY(-30deg) translateX(-100%) scaleX(.5)');
    } else {
      // If the page number is greater, slant and animate the page right as if someone were pulling it.
      transform.push('skewY(30deg) translateX(100%) scaleX(.5)');
    }

    // Updating the page number before the animation has pages can be rapidly flipped.
    this.pageNumber = pageNumber;

    // Do not animate pages that are currently animating.
    oldPages = oldPages.filter(
      (page) => !page.classList.contains(styles.singlePageAnimating)
    );

    await Promise.all(
      oldPages.map((page) => {
        page.classList.add(styles.singlePageAnimating);
        return page.animate({ transform }, this.milliseconds).finished;
      })
    );

    // Destroy old pages.
    oldPages.forEach((page) => page.destroy());
  }
}

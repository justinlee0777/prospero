import styles from './double-page-book-animation.module.css';

import PageElement from '../../page/page-element.interface';
import BookAnimation from '../book-animation.interface';
import BookElement from '../book-element.interface';

interface Config {
  milliseconds: number;
}

/**
 * Animation for double-paged books.
 */
export default class DoublePageBookAnimation implements BookAnimation {
  private milliseconds: number;
  private pageNumber = 0;

  constructor({ milliseconds }: Config = { milliseconds: 600 }) {
    this.milliseconds = milliseconds;
  }

  async changePage(
    book: BookElement,
    pageNumber: number,
    oldPages: Array<PageElement>,
    [leftPage, rightPage]: [PageElement, PageElement]
  ): Promise<void> {
    // Underlay the pages beneath existing pages.
    book.prepend(leftPage, rightPage);

    // Do not animate if there are no pages to delete.
    if (oldPages.length === 0) {
      return;
    }

    /*
     * We're only animating the last two pages
     * (we know this, as pages are prepended so the oldest pages are at the top of the queue).
     */
    const [oldLeftPage, oldRightPage] = oldPages;

    let overPage: PageElement; // Always a page to-be-removed. This starts visible then is flipped invisible.
    let underPage: PageElement; // Always a new page. Start invisible then is flipped visible.

    // Below classes describe whether the page is a right or left page.
    let overPageClass: string;
    let underPageClass: string;

    // The transformation for the over page. (Under page is always animated to its final position.)
    let overPageTransforming: string;

    if (this.pageNumber < pageNumber) {
      // If the page is incremented, we're flipping the right page.
      overPage = oldRightPage;
      underPage = leftPage;

      overPageClass = styles.rightPage;
      underPageClass = styles.leftPage;

      overPageTransforming = 'rotateY(180deg)';
    } else {
      // If the page is decremented, we're flipping the left page.
      overPage = oldLeftPage;
      underPage = rightPage;

      overPageClass = styles.leftPage;
      underPageClass = styles.rightPage;

      overPageTransforming = 'rotateY(-180deg)';
    }

    // If the over page is currently animated, do not send another command for animation.
    const isOverPageAnimating = overPage.classList.contains(
      styles.doublePageAnimating
    );

    // Add the classes to the pages so that they are initialized with their property transform properties.
    overPage.classList.add(styles.doublePageAnimating, overPageClass);
    underPage.classList.add(
      styles.doublePageAnimating,
      underPageClass,
      styles.unveiling
    );

    // Flip the under page.
    const animations = [
      underPage.animate(
        {
          transform: ['rotateY(0)'],
          zIndex: String(oldPages.length * 10),
        },
        this.milliseconds
      ).finished,
    ];

    if (!isOverPageAnimating) {
      // Flip the over page.
      animations.push(
        overPage.animate(
          {
            transform: ['rotateY(180deg)'],
          },
          this.milliseconds
        ).finished
      );
    }

    // Update the page number for future animations, as pages can be rapidly flipped.
    this.pageNumber = pageNumber;

    await Promise.all(animations);

    // Reset the under page's state; work is done.
    underPage.classList.remove(
      styles.doublePageAnimating,
      underPageClass,
      styles.unveiling
    );

    // Clean up and delete the pages.
    oldPages.forEach((page) => page.destroy());
  }
}

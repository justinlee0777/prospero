import PageElement from '../../page/page-element.interface';
import BookAnimation from '../book-animation.interface';
import BookElement from '../book-element.interface';

export default class SinglePageBookAnimation implements BookAnimation {
  private static readonly AnimatingClass = 'SinglePageAnimating';

  private pageNumber = 0;

  async changePage(
    book: BookElement,
    pageNumber: number,
    oldPages: Array<PageElement>,
    [page]: [PageElement]
  ): Promise<void> {
    book.prepend(page);

    const transform = ['skewY(0) translateX(0) scaleX(1)'];

    if (this.pageNumber < pageNumber) {
      transform.push('skewY(-30deg) translateX(-100%) scaleX(.5)');
    } else {
      transform.push('skewY(30deg) translateX(100%) scaleX(.5)');
    }

    this.pageNumber = pageNumber;

    const { AnimatingClass } = SinglePageBookAnimation;

    oldPages = oldPages.filter(
      (page) => !page.classList.contains(AnimatingClass)
    );

    await Promise.all(
      oldPages.map((page) => {
        page.classList.add(AnimatingClass);
        return page.animate({ transform }, 600).finished;
      })
    );

    oldPages.forEach((page) => page.destroy());
  }
}

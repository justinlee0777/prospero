import PageElement from '../../page/page-element.interface';
import BookAnimation from '../book-animation.interface';
import BookElement from '../book-element.interface';

export default class DefaultPageFlipAnimation implements BookAnimation {
  initialize(): void {}

  async changePage(
    book: BookElement,
    _: number,
    oldPages: Array<PageElement>,
    newPages: Array<PageElement>
  ) {
    book.prepend(...newPages);
    oldPages.forEach((page) => page.destroy());
  }
}

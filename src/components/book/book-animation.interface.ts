import PageElement from '../page/page-element.interface';
import BookElement from './book-element.interface';

export default interface BookAnimation {
  changePage(
    book: BookElement,
    pageNumber: number,
    oldPages: Array<PageElement>,
    newPages: Array<PageElement>
  ): Promise<void>;
}

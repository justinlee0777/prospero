import ContainerStyle from '../../container-style.interface';
import CreateElementConfig from '../../elements/create-element.config';
import GetPage from '../../get-page.interface';
import BookElement from './book-element.interface';

interface BookArgs {
  getPage: GetPage;

  currentPage?: number;
  containerStyles?: ContainerStyle;
  pageStyles?: Partial<CSSStyleDeclaration>;
  pagesShown?: number;
}

export default interface CreateBookElement {
  (book: BookArgs, config?: CreateElementConfig): BookElement;
}

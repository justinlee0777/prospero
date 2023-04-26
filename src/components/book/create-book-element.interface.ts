import ContainerStyle from '../../container-style.interface';
import { CreateElementConfig } from '../../elements/create-element.interface';
import GetPage from '../../get-page.interface';
import BookElement from './book-element.interface';
import PageLayout from './page-layout.enum';

interface BookArgs {
  getPage: GetPage;

  currentPage?: number;
  containerStyles?: ContainerStyle;
  pageStyles?: Partial<CSSStyleDeclaration>;
  pageLayout?: PageLayout;
}

export default interface CreateBookElement {
  (book: BookArgs, config?: CreateElementConfig): BookElement;
}

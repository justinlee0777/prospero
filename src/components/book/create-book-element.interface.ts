import ContainerStyle from '../../container-style.interface';
import CreateElementConfig from '../../elements/create-element.config';
import GetPage from '../../get-page.interface';
import PagesOutput from '../../pages-output.interface';
import BookAttributes from './book-attributes.interface';
import BookElement from './book-element.interface';

interface BookArgsWithGetPage {
  getPage: GetPage;
  containerStyles: ContainerStyle;
}

interface BooksArgsWithPages extends PagesOutput {}

type RequiredBookArgs = BookArgsWithGetPage | BooksArgsWithPages;

interface OptionalBookArgs extends BookAttributes {
  currentPage?: number;
  pageStyles?: Partial<CSSStyleDeclaration>;
  pagesShown?: number;
}

export default interface CreateBookElement {
  (
    requiredArgs: RequiredBookArgs,
    optionalArgs?: OptionalBookArgs,
    config?: CreateElementConfig
  ): BookElement;
}

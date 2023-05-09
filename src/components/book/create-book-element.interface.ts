import ContainerStyle from '../../container-style.interface';
import CreateElementConfig from '../../elements/create-element.config';
import GetPage from '../../get-page.interface';
import PagesOutput from '../../pages-output.interface';
import BookConfig from './book-config.interface';
import BookElement from './book-element.interface';

interface BookArgsWithGetPage {
  getPage: GetPage;
  containerStyles: ContainerStyle;
}

interface BooksArgsWithPages extends PagesOutput {}

type RequiredBookArgs = BookArgsWithGetPage | BooksArgsWithPages;

export default interface CreateBookElement {
  (
    requiredArgs: RequiredBookArgs,
    optionalArgs?: BookConfig,
    config?: CreateElementConfig
  ): BookElement;
}

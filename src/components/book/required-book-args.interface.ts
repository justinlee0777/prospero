import ContainerStyle from '../../container-style.interface';
import GetPage from '../../get-page.interface';
import PagesOutput from '../../pages-output.interface';

interface BookArgsWithGetPage {
  getPage: GetPage;
  containerStyles: ContainerStyle;
}

interface BooksArgsWithPages extends PagesOutput {}

type RequiredBookArgs = BookArgsWithGetPage | BooksArgsWithPages;

export default RequiredBookArgs;

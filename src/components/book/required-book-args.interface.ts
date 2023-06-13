import GetPage from '../../get-page.interface';
import PageStyles from '../../page-styles.interface';
import PagesOutput from '../../pages-output.interface';

interface BookArgsWithGetPage {
  getPage: GetPage;
  pageStyles: PageStyles;
}

interface BooksArgsWithPages extends PagesOutput {}

type RequiredBookArgs = BookArgsWithGetPage | BooksArgsWithPages;

export default RequiredBookArgs;

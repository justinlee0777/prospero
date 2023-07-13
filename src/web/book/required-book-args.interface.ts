import GetPage from '../../models/get-page.interface';
import PageStyles from '../../models/page-styles.interface';
import PagesOutput from '../../models/pages-output.interface';

interface BookArgsWithGetPage {
  getPage: GetPage;
  pageStyles: PageStyles;
}

interface BooksArgsWithPages extends PagesOutput {}

type RequiredBookArgs = BookArgsWithGetPage | BooksArgsWithPages;

export default RequiredBookArgs;

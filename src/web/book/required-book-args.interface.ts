import GetPage from '../../models/get-page.interface';
import PagesOutput from '../../models/pages-output.interface';

type PageInfo = Pick<PagesOutput, 'pageStyles' | 'html'>;

interface BookArgsWithGetPage extends PageInfo {
  getPage: GetPage;
}

interface BooksArgsWithPages extends PagesOutput {}

type RequiredBookArgs = BookArgsWithGetPage | BooksArgsWithPages;

export default RequiredBookArgs;

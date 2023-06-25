import Theme from '../theme.interface';
import bookStyles from './default-book.module.css';
import pageStyles from './default-page.module.css';

const DefaultBookTheme: Theme = {
  className: bookStyles.defaultBookTheme,
  pageClassName: pageStyles.defaultPageTheme,
};

export default DefaultBookTheme;

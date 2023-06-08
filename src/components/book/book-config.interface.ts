import AddListeners from '../model/add-listeners.interface';
import BookAttributes from './book-attributes.interface';
import Theme from './theming/theme.interface';

export default interface BookConfig extends BookAttributes {
  currentPage?: number;
  pageStyles?: Partial<CSSStyleDeclaration>;
  pagesShown?: number;
  listeners?: Array<AddListeners>;
  showPageNumbers?: boolean;
  theme?: Theme;
}

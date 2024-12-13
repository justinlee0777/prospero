import { TableOfContentsConfig } from '../../models/table-of-contents.interface';
import Optional from '../../utils/optional.type';
import BookmarkStorage from '../bookmark/bookmark-storage.interface';
import AddListeners from '../model/add-listeners.interface';
import Component from '../model/component.interface';
import BookAttributes from './book-attributes.interface';
import Theme from './theming/theme.interface';

export default interface BookConfig extends BookAttributes {
  /** Page to initialize on. */
  currentPage?: number;
  /** Styles for the page. */
  pageStyles?: Partial<CSSStyleDeclaration>;
  /** Number of pages to show. The ultimate width of the book will be the width from 'pageStyles' multipled by this. */
  pagesShown?: number;
  /** Manipulate the book with event listeners. */
  listeners?: Array<AddListeners>;
  /** Whether to show the page numbers on the bottom of the page/ */
  showPageNumbers?: boolean;
  /** Used to configure the appearance of the book through class names. */
  theme?: Theme;
  /** Show an input that the user can use to change the page directly. */
  showPagePicker?: boolean;
  /** Use a bookmark by hooking it to a bookmark storage. */
  showBookmark?: {
    storage: BookmarkStorage;
  };
  pictureInPicture?: {
    /** The CSS selector that finds the elements that should be put into an overlay. */
    affectedElements: string;
    /** Whether the overlay should lock into the quarters of the view or into the side. */
    autoLock?: boolean;
  };
  /** Used to customize what shows on the screen when the book is getting a page.*/
  loading?: () => HTMLElement & Optional<Component, 'prospero'>;
  tableOfContents?: TableOfContentsConfig | Promise<TableOfContentsConfig>;
}

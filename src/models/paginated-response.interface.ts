import PageStyles from './page-styles.interface';

export default interface PaginatedResponse {
  value: {
    html: boolean;
    pageStyles: PageStyles;
    content: Array<string>;
  };
  page: {
    /** Current page. */
    pageNumber: number;
    /** Size of the page. */
    pageSize: number;
    /** Total pages. */
    pages: number;
    /** Total number of pages. */
    totalSize: number;
  };
}

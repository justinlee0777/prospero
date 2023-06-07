import ContainerStyle from './container-style.interface';

export default interface PaginatedResponse {
  value: {
    containerStyles: ContainerStyle;
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

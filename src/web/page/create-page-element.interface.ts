import CreateElementConfig from '../../elements/create-element.config';
import PageElement from './page-element.interface';
import PageNumberingAlignment from './page-numbering-alignment.enum';

interface PageArgs {
  /**
   * Whether the content rendered is HTML.
   * This is directly related to how white-space is rendered (if true, then ignore white spaces as HTML naturally does
   * ex. newline, leading spaces; if false, include white spaces, as that is natural to pure text).
   */
  html?: boolean;
  numbering?: {
    pageNumber: number;
    alignment: PageNumberingAlignment;
  };
}

export default interface CreatePageElement {
  (pageArgs: PageArgs, config?: CreateElementConfig): PageElement;
}

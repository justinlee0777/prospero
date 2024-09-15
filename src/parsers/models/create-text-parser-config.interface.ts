import { PageStyles } from '../../models';

export default interface CreateTextParserConfig {
  /** In pixels. */
  fontSize: number;
  /** The height of a page. */
  pageHeight: number;
  /** The width of the page, in pixels. */
  pageWidth: number;
  pageStyles: PageStyles;
}

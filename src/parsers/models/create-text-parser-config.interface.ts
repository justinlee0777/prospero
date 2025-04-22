import { PagesConfig, PageStyles } from '../../models';

export default interface CreateTextParserConfig
  extends Pick<PagesConfig, 'sectionBreak' | 'footnotes'> {
  /** In pixels. */
  fontSize: number;
  /** The height of a page. */
  pageHeight: number;
  /** The width of the page, in pixels. */
  pageWidth: number;
  pageStyles: PageStyles;
}

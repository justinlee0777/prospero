export default interface CreateTextParserConfig {
  /** Top-level (before inline transformations) line height for the book element in pixels. */
  lineHeight: number;
  /** The height of a page. */
  pageHeight: number;
  /** The width of the page, in pixels. */
  pageWidth: number;
}

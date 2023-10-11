import Big from 'big.js';

/**
 * The current state of the text parser.
 */
export default interface ParserStateObject {
  // The below section describes the book so far.
  pages: Array<string>;
  /** Index in the original text after the change. */
  textIndex: number;

  // The below section describes the page to be built.

  /** The lines of the page. */
  lines: Array<string>;
  /** The current height of the page. */
  pageHeight: Big;

  // The below section describes the line to be built.

  /** The width of the current line in pixels. */
  lineWidth: Big;
  lineHeight: Big;
  /** The text of the current line. */
  lineText: string;
}

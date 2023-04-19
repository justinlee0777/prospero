import Big from 'big.js';

/**
 * The current state of the text parser.
 */
export default interface ParserState {
  // The below section describes the book so far.
  pages: Array<string>;

  // The below section describes the page to be built.

  /** The lines of the page. */
  lines: Array<string>;

  // The below section describes the line to be built.

  /** The width of the current line in pixels. */
  lineWidth: Big;
  /** The line number. */
  line: number;
  /** The text of the current line. */
  lineText: string;
}

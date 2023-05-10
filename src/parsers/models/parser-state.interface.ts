import Big from 'big.js';

import TextChange from './text-change.interface';
import TextChanges from './text-changes.interface';

/**
 * The current state of the text parser.
 */
export default interface ParserState {
  // The below section describes the book so far.
  pages: Array<string>;
  /** Index in the original text after the change. */
  textIndex: number;
  /** Changes made from the passed-in text. */
  changes: Array<TextChanges>;
  /** Line height for the entire book. I don't see any reason currently for this to change as parsing occurs. */
  bookLineHeight: Big;

  // The below section describes the page to be built.

  /** The lines of the page. */
  lines: Array<string>;
  /** The current height of the page. */
  pageHeight: Big;
  pageChanges: Array<TextChange>;

  // The below section describes the line to be built.

  /** The width of the current line in pixels. */
  lineWidth: Big;
  lineHeight: Big;
  /** The text of the current line. */
  lineText: string;
}

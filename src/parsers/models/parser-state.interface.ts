import Big from 'big.js';

import TextChanges from './text-changes.interface';
import TextChange from './text-change.interface';

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

  // The below section describes the page to be built.

  /** The lines of the page. */
  lines: Array<string>;
  pageChanges: Array<TextChange>;

  // The below section describes the line to be built.

  /** The width of the current line in pixels. */
  lineWidth: Big;
  /** The line number. */
  line: number;
  /** The text of the current line. */
  lineText: string;
}

import ParserState from '../../models/parser-state.interface';

export default interface ElementOverflowArgs {
  /**
   * The previous parser state. This is used to compare to the current parser state
   * for any pages that do not have the changed pages, which will be updated retroactively with element tags.
   */
  previous: ParserState;
  /** The opening of the entire HTML tree ex. <div style="line-height: 32px"><span style="color: red"> */
  openingTags: string;
  /** The second element is the closing of the HTML tree ex. </span></div> */
  closingTags: string;
}

import TextStyle from './text-style.interface';

/**
 * Processors decorate text.
 * Prospero by default only handles text. Processors can be used to analyze hints within the text itself to
 * enhance the text, so long as the hints do not change the text height or word widths.
 */
export default interface Processor {
  /**
   * Ran before pages are created. Used to remove hints from the text.
   * @param text is the text the user passes in.
   * @returns the text without decorations.
   */
  preprocess(text: string, textStyle: TextStyle): string;

  /**
   * Ran after pages are created. Used to transform the text using hints.
   * @param pages created. These are pages added, in order; the processor is expected to remember details of past pages.
   * @returns the transformed pages.
   */
  postprocess(...pages: Array<string>): Array<string>;
}

/**
 * Transformers transform text so that the user can keep the text in an immutable form while changing it before
 * releasing a book.
 */
export default interface Transformer {
  /**
   * Flag used to let the transformer know it is meant for HTML. This is set by a client of the
   * transformer.
   */
  forHTML: boolean;

  /**
   * @param text, original
   * @returns the transformed text
   */
  transform(text: string): string;
}

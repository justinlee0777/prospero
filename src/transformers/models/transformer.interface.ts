/**
 * Transformers transform text so that the user can keep the text in an immutable form while changing it before
 * releasing a book.
 */
export default interface Processor {
  /**
   * @param text, original
   * @returns the transformed text
   */
  transform(text: string): string;
}

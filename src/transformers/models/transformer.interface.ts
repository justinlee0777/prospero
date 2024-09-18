export interface AnonymousTransformer {
  /**
   * @param text, original
   * @returns the transformed text
   */
  transform(text: string): string;
}

/**
 * Should be used for code that either
 * 1) relies on ES6 code;
 * 2) is a class object and difficult to serialize.
 */
export interface EjectingTransformer extends AnonymousTransformer {
  source: string;

  eject(): Array<any>;
}

/**
 * Transformers transform text so that the user can keep the text in an immutable form while changing it before
 * releasing a book.
 */
type Transformer = AnonymousTransformer | EjectingTransformer;

export default Transformer;

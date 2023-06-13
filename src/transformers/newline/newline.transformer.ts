import Transformer from '../models/transformer.interface';

/**
 * Add newlines between paragraphs if there are none.
 */
export default class NewlineTransformer implements Transformer {
  transform(text: string): string {
    /**
     * Match lines that end with a newline but also have at least one non-newline character succeeding them, so as not to
     * double-up on line breaks.
     * The first capture group is a newline.
     * The second capture group is a contentful character.
     */
    const pattern = /(\n)([^\n])/g;

    return text.replace(pattern, `$1\n$2`);
  }
}

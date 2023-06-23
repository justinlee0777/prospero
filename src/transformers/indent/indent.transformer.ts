import Transformer from '../models/transformer.interface';

/**
 * Add indentation to new paragraphs.
 */
export default class IndentTransformer implements Transformer {
  private text: string;

  constructor(private spaces: number) {
    this.text = Array(this.spaces).fill(' ').join('');
  }

  transform(text: string): string {
    /*
     * Match lines that end with a newline but also have at least one non-newline character succeeding them (this indicates
     * the line is not just a line-break to separate paragraphs).
     * The first capture group is a newline.
     * The second capture group is a contentful character.
     */
    const pattern = /(\n)([^\n])/g;

    // If the first paragraph is contentful (before the first newline), pad the beginning.
    const padBeginning = text.match(/[^\n]+\n/) ? this.text : '';

    return padBeginning + text.replace(pattern, `$1${this.text}$2`);
  }
}

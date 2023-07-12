import Transformer from '../models/transformer.interface';
import NewlineTransformerOptions from './newline-transformer-options.interface';

/**
 * Add newlines between paragraphs if there are none.
 */
export default class NewlineTransformer implements Transformer {
  forHTML: boolean;

  constructor(private options: NewlineTransformerOptions = {}) {}

  transform(text: string): string {
    /**
     * Match lines that end with a newline but also have at least one non-newline character succeeding them, so as not to
     * double-up on line breaks.
     * The first capture group is a newline.
     * The second capture group is a contentful character.
     */
    const pattern = /(\n)([^\n])/g;

    const sectionBeginning = this.createNewlines(
      this.options?.beginningSections ?? 0
    );
    const betweenParagraphs = this.createNewlines(
      this.options?.betweenParagraphs ?? 1
    );

    return sectionBeginning + text.replace(pattern, `$1${betweenParagraphs}$2`);
  }

  private createNewlines(number: number): string {
    return Array(number).fill('\n').join('');
  }
}

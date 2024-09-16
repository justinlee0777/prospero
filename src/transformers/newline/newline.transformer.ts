import createHTMLRegex from '../../regexp/html.regexp';
import Transformer from '../models/transformer.interface';
import NewlineTransformerOptions from './newline-transformer-options.interface';

/**
 * Add newlines between paragraphs if there are none.
 */
export default class NewlineTransformer implements Transformer {
  private readonly tags = new Set(['div']);

  private sectionBegan = false;

  constructor(private options: NewlineTransformerOptions = {}) {}

  transform(text: string): string {
    const sectionBeginning = this.sectionBegan
      ? ''
      : this.createNewlines(this.options?.beginningSections ?? 0);
    const betweenParagraphs = this.createNewlines(
      this.options?.betweenParagraphs ?? 1
    );

    const pattern = createHTMLRegex();

    // Skip the first HTML tag encountered. We will use the "beginningSections" config instead.
    let skipFirst = !this.sectionBegan;

    return text.replace(
      pattern,
      (match, opening, tagName, tagContent = '', ending = '') => {
        if (skipFirst) {
          this.sectionBegan = true;
          skipFirst = false;

          return `${opening}${sectionBeginning}${tagContent}${ending}`;
        } else if (this.tags.has(tagName)) {
          return `${opening}${betweenParagraphs}${tagContent}${ending}`;
        } else {
          return match;
        }
      }
    );
  }

  private createNewlines(number: number): string {
    return Array(number).fill('\n').join('');
  }
}

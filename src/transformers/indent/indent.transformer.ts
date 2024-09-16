import createHTMLRegex from '../../regexp/html.regexp';
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
    const htmlPattern = createHTMLRegex();
    /*
     * The additional capture group, which is optional, is to check for newlines succeeding the void tag.
     * Any whitespace here gets ignored, so the newline is placed after.
     */
    const pattern = new RegExp(
      `(<([A-Za-z0-9]+).*?/?>)(\n+)?`,
      htmlPattern.flags
    );

    return text.replace(pattern, (match, opening, tagName, newline = '') => {
      // Place newline after the tag opening.
      return `${opening}${newline}${this.text}`;
    });
  }
}

import blockLevelTags from '../../html/allowed-html/allowed-block-level-tags.const';
import allowedVoidTags from '../../html/allowed-html/allowed-void-elements.const';
import createHTMLRegex from '../../regexp/html.regexp';
import Transformer from '../models/transformer.interface';

/**
 * Add indentation to new paragraphs.
 */
export default class IndentTransformer implements Transformer {
  forHTML: boolean;

  private readonly blockTags = new Set(blockLevelTags);

  private readonly voidTags = new Set(allowedVoidTags);

  private text: string;

  constructor(private spaces: number) {
    this.text = Array(this.spaces).fill(' ').join('');
  }

  transform(text: string): string {
    if (this.forHTML) {
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
        if (this.blockTags.has(tagName) || this.voidTags.has(tagName)) {
          // Place newline after the tag opening.
          return `${opening}${newline}${this.text}`;
        } else {
          return match;
        }
      });
    } else {
      /*
       * Match lines that end with a newline but also have at least one non-newline character succeeding them (this indicates
       * the line is not just a line-break to separate paragraphs).
       * The first capture group is a newline.
       * The second capture group is a contentful character.
       */
      const pattern = /(\n)([^\n])/g;

      if (text[0] !== '\n') {
        text = this.text + text;
      }

      return text.replaceAll(pattern, `$1${this.text}$2`);
    }
  }
}

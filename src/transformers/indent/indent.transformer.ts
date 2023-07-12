import Transformer from '../models/transformer.interface';

/**
 * Add indentation to new paragraphs.
 */
export default class IndentTransformer implements Transformer {
  forHTML: boolean;

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
    let pattern = /(\n)([^\n])/g;

    if (this.forHTML) {
      /*
       * Adds a non-captured expression for the HTML tag (<.*>), which is optional (using ?).
       * Also added '<' in the negative list at the end.
       * This regex does not target HTML with no content, as they are ignored.
       */
      pattern = /(\n)(?:<.*>)?([^\n<])/g;
    }

    const result = /<.*?>/.exec(text);
    if (result?.index === 0) {
      const matchedTag = result[0];

      text =
        text.slice(0, matchedTag.length) +
        this.text +
        text.slice(matchedTag.length);
    } else if (/[^\n]/.exec(text)?.index === 0) {
      text = this.text + text;
    }

    return text.replace(pattern, `$1${this.text}$2`);
  }
}

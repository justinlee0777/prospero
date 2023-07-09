import createHTMLRegex from '../../regexp/html.regexp';
import HTMLTransformerOptions from './html-transformer-options.interface';

interface HTMLTransformerConfig {
  fontSize: number;
}

interface TransformTag {
  (tagContent: string): string;
}

/**
 * Transform certain HTML tags into a tag compatible with the parser.
 * For example, h1..6 will be converted to <span> with the appropriate font size.
 */
export default class HTMLTransformer {
  private headings: Map<string, TransformTag> = new Map([
    [
      'h1',
      (tagContent) =>
        `<span style="font-weight: bold; font-size: ${
          this.config.fontSize * 2
        }px">${tagContent}</span>`,
    ],
    [
      'h2',
      (tagContent) =>
        `<span style="font-weight: bold; font-size: ${
          this.config.fontSize * 1.5
        }px">${tagContent}</span>`,
    ],
    [
      'h3',
      (tagContent) =>
        `<span style="font-weight: bold; font-size: ${
          this.config.fontSize * 1.17
        }px">${tagContent}</span>`,
    ],
    [
      'h4',
      (tagContent) => `<span style="font-weight: bold">${tagContent}</span>`,
    ],
    [
      'h5',
      (tagContent) =>
        `<span style="font-weight: bold; font-size: ${
          this.config.fontSize * 0.83
        }px">${tagContent}</span>`,
    ],
    [
      'h6',
      (tagContent) =>
        `<span style="font-weight: bold; font-size: ${
          this.config.fontSize * 0.67
        }px">${tagContent}</span>`,
    ],
  ]);

  constructor(
    private config: HTMLTransformerConfig,
    private options?: HTMLTransformerOptions
  ) {}

  transform(text: string): string {
    this.headings.forEach((transform, tag) => {
      text = text.replaceAll(createHTMLRegex(tag), (...args) =>
        transform(args.at(3))
      );
    });

    const hrString = this.options?.hrString ?? '* * *';

    text = text.replaceAll(
      /\<hr\/?\>/g,
      () =>
        `<div style="display: inline-block; text-align: center; width: 100%">${hrString}</div>`
    );

    return text;
  }
}

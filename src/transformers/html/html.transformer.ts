import createHTMLRegex from '../../regexp/html.regexp';
import Transformer from '../models/transformer.interface';
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
export default class HTMLTransformer implements Transformer {
  readonly forHTML = true;

  private headings: Map<string, TransformTag> = new Map([
    [
      'h1',
      (tagContent) =>
        `<div style="margin: 0; font-weight: bold; font-size: ${
          this.config.fontSize * 2
        }px">${tagContent}</div>`,
    ],
    [
      'h2',
      (tagContent) =>
        `<div style="margin: 0; font-weight: bold; font-size: ${
          this.config.fontSize * 1.5
        }px">${tagContent}</div>`,
    ],
    [
      'h3',
      (tagContent) =>
        `<div style="margin: 0; font-weight: bold; font-size: ${
          this.config.fontSize * 1.17
        }px">${tagContent}</div>`,
    ],
    [
      'h4',
      (tagContent) =>
        `<div style="margin: 0; font-weight: bold">${tagContent}</div>`,
    ],
    [
      'h5',
      (tagContent) =>
        `<div style="margin: 0; font-weight: bold; font-size: ${
          this.config.fontSize * 0.83
        }px">${tagContent}</div>`,
    ],
    [
      'h6',
      (tagContent) =>
        `<div style="margin: 0; font-weight: bold; font-size: ${
          this.config.fontSize * 0.67
        }px">${tagContent}</div>`,
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
      createHTMLRegex('hr'),
      () =>
        `<div style="text-align: center; width: 100%">${hrString}</div>`
    );

    text = text.replaceAll(createHTMLRegex('p'), (...args) => {
      const content = args.at(3);

      return `<div style="margin: 0;">${content}</div>`;
    });

    text = text.replaceAll(createHTMLRegex('blockquote'), (...args) => {
      const content = args.at(3);

      return `<div style="margin: 0 ${
        this.config.fontSize * 2
      }px;">${content}</div>`;
    });

    return text;
  }
}

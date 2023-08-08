import blockLevelTags from '../../parsers/html/block-level-tags.const';
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

  private readonly blockLevelTags = blockLevelTags;

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
      createHTMLRegex('hr'),
      () =>
        `<div style="white-space: pre-wrap; display: inline-block; text-align: center; width: 100%">${hrString}</div>`
    );

    text = text.replaceAll(createHTMLRegex('p'), (...args) => {
      const content = args.at(3);

      return `<div style="white-space: pre-wrap; margin: 0;">${content}</div>`;
    });

    text = text.replaceAll(createHTMLRegex('blockquote'), (...args) => {
      const content = args.at(3);

      return `<div style="white-space: pre-wrap; margin: 0 ${
        this.config.fontSize * 2
      }px;">${content}</div>`;
    });

    return text;
  }
}

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
      createHTMLRegex('hr', true),
      () =>
        `<div style="display: inline-block; text-align: center; width: 100%">${hrString}</div>`
    );

    text = text.replaceAll(createHTMLRegex('blockquote'), (...args) => {
      const content = args.at(3);

      return `<div style="display: inline-block; margin: 0 ${
        this.config.fontSize * 2
      }px;">${content}</div>`;
    });

    text = this.blockLevelTags.reduce((finalText, tag) => {
      /*
       * Capture group: The opening tag for a block-level element.
       * After the capture group is at least one space character.
       * The regex removes the unnecessary space in a block-level element which is ignored (based on
       * 'white-space: normal').
       */
      const openingSpaces = new RegExp(`(<${tag}[^\\/]*?>)\\s+`, 'g');

      /*
       * First capture group: any end of a tag.
       * Second capture group: the end of a block-level element.
       * In-between is at least one space character.
       * The regex removes the unnecessary space at the end of a block-level element ONLY if the element
       * is nested.
       */
      const endingSpaces = new RegExp(`(<\\/.*?>)\\s+(<\\/${tag}>)`, 'g');

      return finalText
        .replaceAll(openingSpaces, '$1')
        .replaceAll(endingSpaces, '$1$2');
    }, text);

    return text;
  }
}

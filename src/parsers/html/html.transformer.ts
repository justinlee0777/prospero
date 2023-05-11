import createHTMLRegex from '../../regexp/html.regexp';

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
  ]);

  constructor(private config: { fontSize: number }) {}

  transform(text: string): string {
    this.headings.forEach((transform, tag) => {
      text = text.replaceAll(createHTMLRegex(tag), (...args) =>
        transform(args.at(3))
      );
    });

    return text;
  }
}

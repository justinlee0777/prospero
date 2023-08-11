import allowedVoidTags from './allowed-void-elements.const';
import voidTags from './void-elements.const';

/**
 * Text content with information on the HTML tag, if any.
 */
export type Token = TextToken | HTMLToken | EndHTMLToken;

export enum TokenType {
  TEXT,
  HTML,
  END_HTML,
}

export interface TextToken {
  content: string;
  type: TokenType.TEXT;
}

export interface HTMLToken {
  /** Information on the tag if the text is nested in an HTML tag. */
  tag: {
    name: string;
    opening: string;
    closing?: string;
  };
  type: TokenType.HTML;
}

/**
 * Denotes the end of an HTML tag.
 */
export interface EndHTMLToken {
  tagName: string;
  type: TokenType.END_HTML;
}

export interface ElementConstruct {
  childNodes: any;
  tagName: string;
}

/**
 * Creates tokens out of an HTML string that the HTMLParser consumes.
 */
export default abstract class HTMLTokenizer<
  Loader = any,
  Element extends ElementConstruct = any
> {
  private static allowedVoidTags = allowedVoidTags;
  private static voidTags = voidTags;

  private loader: Loader;

  constructor() {}

  *getTokens(text: string): Generator<Token> {
    const loader = (this.loader = this.loadHTML(text));

    yield* this.parseHTMLElement(this.getRoot(loader));
  }

  abstract loadHTML(text: string): Loader;

  abstract getRoot(loader: Loader): Element;

  abstract getInnerHTML(element: Element, loader: Loader): string;

  abstract getOuterHTML(element: Element, loader: Loader): string;

  abstract getText(element: Element, loader: Loader): string;

  private *parseHTMLElement(element: Element): Generator<Token> {
    for (const node of element.childNodes) {
      switch (node.nodeType) {
        case 1:
          const element = node as unknown as Element;
          const tagName = element.tagName.toLowerCase();

          const closing = !HTMLTokenizer.voidTags.includes(tagName)
            ? `</${tagName}>`
            : undefined;

          const openingPattern = /<[A-Za-z0-9]+.*?\/?>/;

          yield {
            tag: {
              name: tagName,
              opening: this.getOuterHTML(element, this.loader)
                .match(openingPattern)
                .at(0),
              closing,
            },
            type: TokenType.HTML,
          };

          yield* this.parseHTMLElement(element);

          break;
        case 3:
          yield {
            content: this.getText(node, this.loader),
            type: TokenType.TEXT,
          };
          break;
      }
    }

    const tagName = element.tagName.toLowerCase();

    if (!HTMLTokenizer.allowedVoidTags.includes(tagName)) {
      yield {
        tagName,
        type: TokenType.END_HTML,
      };
    }
  }
}

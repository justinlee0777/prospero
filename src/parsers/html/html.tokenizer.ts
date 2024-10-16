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
export default class HTMLTokenizer {
  private static allowedVoidTags = allowedVoidTags;
  private static voidTags = voidTags;

  constructor() {}

  *getTokens(text: string): Generator<Token> {
    const loader = this.loadHTML(text);

    yield* this.parseHTMLElement(this.getRoot(loader));
  }

  loadHTML(text: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/html');
  }

  getRoot(document: Document): HTMLElement {
    return document.body;
  }

  getInnerHTML(element: HTMLElement): string {
    return element.innerHTML;
  }

  getOuterHTML(element: HTMLElement): string {
    return element.outerHTML;
  }

  getText(element: HTMLElement): string {
    return element.textContent ?? '';
  }

  private *parseHTMLElement(element: Element): Generator<Token> {
    for (const node of element.childNodes) {
      switch (node.nodeType) {
        case 1:
          const element = node as unknown as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          const closing = !HTMLTokenizer.voidTags.includes(tagName)
            ? `</${tagName}>`
            : undefined;

          const openingPattern = /<[A-Za-z0-9]+.*?\/?>/;

          yield {
            tag: {
              name: tagName,
              opening:
                this.getOuterHTML(element).match(openingPattern)?.at(0) ?? '',
              closing,
            },
            type: TokenType.HTML,
          };

          yield* this.parseHTMLElement(element);

          break;
        case 3:
          yield {
            content: this.getText(node as HTMLElement),
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

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
  footnote?: Element;
}

/**
 * Denotes the end of an HTML tag.
 */
export interface EndHTMLToken {
  tagName: string;
  type: TokenType.END_HTML;
}

interface Config {
  footnotes?: string;
}

/**
 * Creates tokens out of an HTML string that the HTMLParser consumes.
 */
export default class HTMLTokenizer {
  private static allowedVoidTags = allowedVoidTags;
  private static voidTags = voidTags;

  private generator: Generator<Token>;

  private footnotes: Array<Element> = [];

  constructor(text: string, config: Config) {
    const loader = this.loadHTML(text);

    const element = this.getRoot(loader);

    if (config.footnotes) {
      const footnotes = (this.footnotes = [
        ...element.querySelectorAll(config.footnotes),
      ]);

      footnotes.forEach((element) => element.remove());
    }

    this.generator = this.parseHTMLElement(element, config);
  }

  *getTokens(): Generator<Token> {
    yield* this.generator;
  }

  private loadHTML(text: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/html');
  }

  private getRoot(document: Document): HTMLElement {
    return document.body;
  }

  private getOuterHTML(element: HTMLElement): string {
    return element.outerHTML;
  }

  private getText(element: HTMLElement): string {
    return element.textContent ?? '';
  }

  private *parseHTMLElement(
    element: Element,
    config: Config
  ): Generator<Token> {
    for (const node of element.childNodes) {
      switch (node.nodeType) {
        case 1:
          const element = node as unknown as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          const closing = !HTMLTokenizer.voidTags.includes(tagName)
            ? `</${tagName}>`
            : undefined;

          const openingPattern = /<[A-Za-z0-9]+.*?\/?>/;

          let footnote: Element | undefined;

          if (this.footnotes.length > 0) {
            const footnoteIdentifier = (element as HTMLAnchorElement).href
              ?.split('#')
              .at(-1);

            if (footnoteIdentifier) {
              footnote = this.footnotes.find((element) =>
                element.matches(`#${footnoteIdentifier}`)
              );
            }
          }

          yield {
            tag: {
              name: tagName,
              opening:
                this.getOuterHTML(element).match(openingPattern)?.at(0) ?? '',
              closing,
            },
            type: TokenType.HTML,
            footnote,
          };

          yield* this.parseHTMLElement(element, config);

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

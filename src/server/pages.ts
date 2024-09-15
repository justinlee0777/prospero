import { chromium, Page } from 'playwright';
import { IPages, PagesConfig, PagesOutput, PageStyles } from '../models';
import PagesAsIndicesOutput from '../models/pages-as-indices-output.interface';
import { BlockStyles } from '../parsers/html/block-styles.interface';
import BoxProperties from '../parsers/html/box-properties.interface';
import { FontStyles } from '../parsers/html/font-styles.interface';
import { Token } from '../parsers/html/html.tokenizer';
import ParserContext from '../parsers/html/parser-context.interface';
import Styles from '../parsers/html/styles.interface';
import CreateTextParserConfig from '../parsers/models/create-text-parser-config.interface';
import Transformer from '../transformers/models/transformer.interface';
import pageStylesToStyleDeclaration from '../utils/container-style-to-style-declaration.function';
import toPixelUnits from '../utils/to-pixel-units.function';

/**
 * A function that can be ran by Playwright's evaluate
 */
export async function getAllPages(
  playwrightPage: Page,
  text: string,
  styles: Partial<CSSStyleDeclaration>,
  config: CreateTextParserConfig
): Promise<Array<string>> {
  return playwrightPage.evaluate(
    ({ text, styles, config }) => {
      const allowedVoidTags = ['br'];

      const voidTags = [
        ...allowedVoidTags,
        'area',
        'col',
        'embed',
        'hr',
        'img',
        'input',
        'link',
        'meta',
        'param',
      ];

      const dash = '-';

      const whitespace = ' ';

      const newline = '\n';

      /**
       * <token> = <punctuatedWord> | <whitespace> | <newline>
       * <punctuatedWord> = <punctuation> <word> <punctuation>
       * <punctuation> = "!" | "?" ... | ""
       * <word> = alphabetic sequence with at least one character
       * <whitespace> = " -"
       * <newline> = "\n"
       */
      const whitespaceExpression = `${whitespace}|${dash}`;
      const newlineExpression = newline;
      /**
       * 1. As phrases with dashes can be cut by the dash, such that the
       * word preceding contains the dash, we look for "{word without dash}{dash, optionally}"
       */
      const characterExpression = `[^${whitespace}\\${dash}${newline}]+${dash}?`;

      const expressions = [
        `(?<word>${characterExpression})`,
        `(?<whitespace>${whitespaceExpression})`,
        `(?<newline>${newlineExpression})`,
      ];

      const tokenExpression = new RegExp(expressions.join('|'), 'g');

      const contexts: Array<ParserContext> = [
        {
          pageWidth: config.pageWidth,
          // lineHeight: Big(0),
          blockStyles: {
            margin: '0px',
          },
        },
      ];

      function* parseHTMLElement(element: Element): Generator<Token> {
        for (const node of element.childNodes) {
          switch (node.nodeType) {
            case 1:
              const element = node as unknown as HTMLElement;
              const tagName = element.tagName.toLowerCase();

              const closing = !voidTags.includes(tagName)
                ? `</${tagName}>`
                : undefined;

              const openingPattern = /<[A-Za-z0-9]+.*?\/?>/;

              yield {
                tag: {
                  name: tagName,
                  opening: element.outerHTML.match(openingPattern).at(0),
                  closing,
                },
                type: 1,
              } as any;

              yield* parseHTMLElement(element);

              break;
            case 3:
              yield {
                content: node.textContent,
                type: 0,
              } as any;
              break;
          }
        }

        const tagName = element.tagName.toLowerCase();

        if (!allowedVoidTags.includes(tagName)) {
          yield {
            tagName,
            type: 2,
          };
        }
      }

      function extractStyles(htmlString: string): Styles {
        const [styleString = ''] =
          htmlString.match(/style=(["'])(.+?)\1/g) ?? [];

        const styles = [
          ...(styleString.matchAll(
            /([a-zA-Z-]+): *((?:[a-zA-Z0-9\.\-]+ ?)+);?/g
          ) ?? []),
        ];

        const fontStyles: FontStyles = {};
        const blockStyles: BlockStyles = {};

        // Handle a specific use case for <code> tags, which have 'font-family: monospace'.
        const codeRegex = /\<code.*\>/;

        if (codeRegex.test(htmlString)) {
          // Should be overridden by a more specific style.
          fontStyles['font-family'] = 'monospace';
        }

        // Handle a specific use case for <em> tags, which have 'font-style: italic'
        const emRegex = /\<em.*\>/;

        if (emRegex.test(htmlString)) {
          fontStyles['font-style'] = 'italic';
        }

        const strongRegex = /\<strong.*\>/;

        if (strongRegex.test(htmlString)) {
          fontStyles['font-weight'] = 'bold';
        }

        for (const [, property, value] of styles) {
          if (
            ['font-family', 'font-weight', 'font-size', 'font-style'].includes(
              property
            )
          ) {
            // Only permit allowed font styles.
            fontStyles[property] = value;
          }
          if (['margin', 'white-space'].includes(property)) {
            blockStyles[property] = value;
          }
        }

        return [
          ['font', fontStyles],
          ['block', blockStyles],
        ].reduce((acc, [key, styles]: [string, Object]) => {
          return {
            ...acc,
            [key]: Object.keys(styles).length > 0 ? styles : null,
          };
        }, {}) as Styles;
      }

      function getMargin(cssValue: string): BoxProperties {
        const values = cssValue.split(' ').map((value) => parseInt(value));

        if (values.length > 3) {
          return {
            top: values[0],
            right: values[1],
            bottom: values[2],
            left: values[3],
          };
        } else if (values.length > 2) {
          const [top, x, bottom] = values;

          return {
            top,
            right: x,
            bottom,
            left: x,
          };
        } else if (values.length > 1) {
          const [y, x] = values;

          return {
            top: y,
            right: x,
            bottom: y,
            left: x,
          };
        } else {
          const [value] = values;

          return {
            top: value,
            right: value,
            bottom: value,
            left: value,
          };
        }
      }

      function createParserContext(
        tagOpening: string,
        tagName: string
      ): ParserContext {
        const context = contexts.at(-1);
        const { font: fontStyles, block: blockStyles } =
          extractStyles(tagOpening);

        let { pageWidth } = context;

        if (blockStyles) {
          const marginStyle = blockStyles.margin;
          if (marginStyle) {
            const margin = getMargin(marginStyle);
            pageWidth -= margin.left + margin.right;
          }
        }

        return {
          tag: {
            opening: tagOpening,
            name: tagName,
          },
          pageWidth,
          blockStyles,
          fontStyles,
        };
      }

      function getOpeningTag(last = true): string {
        const context = contexts.at(-1);
        const returnedContexts = last ? [context] : contexts.slice();

        return returnedContexts.reduce(
          (tag, context) => (tag += context.tag?.opening ?? ''),
          ''
        );
      }

      function getClosingTag(last = true): string {
        const context = contexts.at(-1);

        const returnedContexts = last ? [context] : contexts.slice().reverse();

        return returnedContexts.reduce(
          (tag, context) =>
            (tag += context.tag ? `</${context.tag.name}>` : ''),
          ''
        );
      }

      function handlePageEnd(pageText: string): string {
        const closingTag = getClosingTag(false);

        return pageText + closingTag;
      }

      const textElement = document.createElement('div');

      textElement.style.overflowY = 'hidden';

      const page = document.createElement('div');

      page.appendChild(textElement);

      Object.entries(styles).forEach(([key, value]) => {
        page.style[key] = value;
      });

      document.body.appendChild(page);

      const computedStyles = getComputedStyle(page);
      const pageHeight =
        page.clientHeight -
        parseFloat(computedStyles.paddingTop) -
        parseFloat(computedStyles.paddingBottom);

      let pageContent = '';

      const parser = new DOMParser();

      const textDocument = parser.parseFromString(text, 'text/html');

      const tokens = parseHTMLElement(textDocument.body);

      const pages: Array<string> = [];

      for (const token of tokens) {
        if (token.type === 0) {
          const textContent = token.content;

          const textTokens = textContent.matchAll(tokenExpression);

          for (const textToken of textTokens) {
            const [word] = textToken;

            const newPageContent = pageContent + word;

            textElement.innerHTML = newPageContent;

            if (textElement.clientHeight >= pageHeight) {
              const page = handlePageEnd(pageContent);

              pages.push(page);

              const openingTag = getOpeningTag();

              pageContent = `${openingTag}${word}`;
            } else {
              pageContent = newPageContent;
            }
          }
        } else if (token.type === 1) {
          if (token.tag.closing) {
            const opening = token.tag.opening;
            const tagName = token.tag.name;

            const context = createParserContext(opening, tagName);

            contexts.push(context);

            // Create an opening tag.
            pageContent += getOpeningTag();
          } else {
            switch (token.tag.name) {
              case 'br':
                pageContent += '<br/>';
                break;
              default:
                console.error(
                  `Void-content tag '${token.tag.name}' is not supported by HTMLParser. Please contact the code owner.`
                );
            }
          }
        } else if (token.type === 2) {
          pageContent += getClosingTag();

          contexts.pop();
        }
      }

      pages.push(pageContent);

      return pages;
    },
    { text, styles, config }
  );
}

export default class Pages
  implements Pick<IPages, 'getData' | 'getDataAsIndices'>
{
  private styles: Partial<CSSStyleDeclaration>;
  private parserConfig: CreateTextParserConfig;

  constructor(
    private pageStyles: PageStyles,
    private text: string,
    transformers?: Array<Transformer>,
    pageConfig: PagesConfig = {}
  ) {
    this.styles = {
      ...pageStylesToStyleDeclaration(pageStyles),
      boxSizing: 'border-box',
      position: 'absolute',
      left: '-99in',
    };
    this.parserConfig = this.createConfig();
  }

  async getData(): Promise<PagesOutput> {
    const browserPage = await this.openBrowser();

    const pages = await getAllPages(
      browserPage,
      this.text,
      this.styles,
      this.parserConfig
    );

    return {
      pages,
      pageStyles: this.pageStyles,
    };
  }

  async getDataAsIndices(): Promise<PagesAsIndicesOutput> {
    const browserPage = await this.openBrowser();

    const stringPages = await getAllPages(
      browserPage,
      this.text,
      this.styles,
      this.parserConfig
    );

    let text = '';
    let pages: PagesAsIndicesOutput['pages'] = [];

    let index = 0;

    stringPages.forEach((page) => {
      text += page;
      pages.push({
        beginIndex: index,
        endIndex: (index += page.length),
      });
    });

    return {
      text,
      pages,
      pageStyles: this.pageStyles,
    };
  }

  private async openBrowser(): Promise<Page> {
    // TODO: Needs to be customizable instead of hardcoded to chromium
    const browser = await chromium.launch();

    const context = await browser.newContext();

    const page = await context.newPage();

    return page;
  }

  private createConfig(): CreateTextParserConfig {
    const { width, height, computedFontSize, padding, margin, border } =
      this.pageStyles;

    const containerWidth =
      width -
      padding.left -
      padding.right -
      margin.left -
      margin.right -
      border.left -
      border.right;

    const containerHeight =
      height -
      padding.top -
      padding.bottom -
      margin.top -
      margin.bottom -
      border.top -
      border.bottom;

    return {
      fontSize: toPixelUnits(computedFontSize),
      pageHeight: containerHeight,
      pageWidth: containerWidth,
      pageStyles: this.pageStyles,
    };
  }
}

import div from '../../elements/div.function';
import { dash, newline, whitespace } from '../../glyphs.const';
import Transformer from '../../transformers/models/transformer.interface';
import pageStylesToStyleDeclaration from '../../utils/container-style-to-style-declaration.function';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import Parser from '../models/parser.interface';
import extractStyles from './extract-styles.function';
import getMargin from './get-margin.function';
import HTMLTokenizer, { TokenType } from './html.tokenizer';
import ParserContext from './parser-context.interface';

export default class HTMLParser implements Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly.
   */
  public debug: CreateTextParserConfig;

  /**
   * Current HTML context to parse text with.
   * The 0th element is the root of the document, which has no enhancements.
   */
  private contexts: Array<ParserContext>;

  /**
   * The last context pushed, which is the current tag worked with.
   */
  private get context(): ParserContext {
    return this.contexts.at(-1);
  }

  private transformers: Array<Transformer> = [];

  private tokenExpression: RegExp;

  constructor(private config: CreateTextParserConfig) {
    this.debug = config;

    this.contexts = [
      {
        pageWidth: this.config.pageWidth,
        blockStyles: {
          margin: '0px',
        },
      },
    ];

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

    this.tokenExpression = new RegExp(expressions.join('|'), 'g');
  }

  setTransformers(transformers: Array<Transformer>): void {
    this.transformers = transformers;
  }

  *generateParserStates(
    text: string
    // parserState?: ParserState,
    // end = parseEnd
  ): Generator<string> {
    // transform text. Tell the transformers they are working with HTML.
    text = this.transformers.reduce((newText, transformer) => {
      return transformer.transform(newText);
    }, text);

    const { pageStyles } = this.config;

    const styles: Partial<CSSStyleDeclaration> = {
      ...pageStylesToStyleDeclaration(pageStyles),
      boxSizing: 'border-box',
      position: 'absolute',
      left: '-99in',
      whiteSpace: 'pre-wrap',
    };

    const textElement = div({
      styles: {
        overflowY: 'hidden',
      },
    });

    const page = div({
      styles,
      children: [textElement],
    });

    document.body.appendChild(page);

    const computedStyles = getComputedStyle(page);
    const pageHeight =
      page.clientHeight -
      parseFloat(computedStyles.paddingTop) -
      parseFloat(computedStyles.paddingBottom);

    let pageContent = '';

    const tokenizer = new HTMLTokenizer();

    const tokens = tokenizer.getTokens(text);

    for (const token of tokens) {
      if (token.type === TokenType.TEXT) {
        const textContent = token.content;

        const textTokens = textContent.matchAll(this.tokenExpression);

        for (const textToken of textTokens) {
          const [word] = textToken;

          const newPageContent = pageContent + word;

          textElement.innerHTML = newPageContent;

          if (textElement.clientHeight >= pageHeight) {
            yield this.handlePageEnd(pageContent);

            const openingTag = this.getOpeningTag();

            pageContent = `${openingTag}${word}`;
          } else {
            pageContent = newPageContent;
          }
        }
      } else if (token.type === TokenType.HTML) {
        if (token.tag.closing) {
          const opening = token.tag.opening;
          const tagName = token.tag.name;

          const context = this.createParserContext(opening, tagName);

          this.contexts.push(context);

          // Create an opening tag.
          pageContent += this.getOpeningTag();
        } else {
          pageContent += token.tag.opening;
        }
      } else if (token.type === TokenType.END_HTML) {
        pageContent += this.getClosingTag();

        this.contexts.pop();
      }
    }

    yield pageContent;
  }

  *generatePages(text: string): Generator<string> {
    const parserStates = this.generateParserStates(text);

    for (const newParserState of parserStates) {
      yield newParserState;
    }
  }

  /**
   * Create the context for a new HTMLParser, using the given tag opening and name.
   * Calculates font and block styles.
   * If the tag is not allowed by the parser i.e. too difficult to parse, it is ignored and the
   * context is treated as pure text content, using the current parser's context.
   */
  private createParserContext(
    tagOpening: string,
    tagName: string
  ): ParserContext {
    const { font: fontStyles, block: blockStyles } = extractStyles(tagOpening);

    let { pageWidth } = this.context;

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

  /**
   * Gets the opening tag of the current HTML tag or the entire tree.
   * @param last denotes whether to get the current HTML tag or the entire chain.
   */
  private getOpeningTag(last = true): string {
    const contexts = last ? [this.context] : this.contexts.slice();

    return contexts.reduce(
      (tag, context) => (tag += context.tag?.opening ?? ''),
      ''
    );
  }

  /**
   * Gets the closing tag of the current HTML tag or the entire tree.
   * Gets the tags backwards, if the latter.
   * @param last denotes whether to get the current HTML tag or the entire chain.
   */
  private getClosingTag(last = true): string {
    const contexts = last ? [this.context] : this.contexts.slice().reverse();

    return contexts.reduce(
      (tag, context) => (tag += context.tag ? `</${context.tag.name}>` : ''),
      ''
    );
  }

  /**
   * This is a bit of a hack. There's no way currently to inform a child generator that the parent has changed
   * the parser state - for example, to add ending tags at the end of pages or starting tags at the start of new pages.
   * So we are just adding them to every parser state, which is computationally wasteful.
   * @param initialState describes where the parser began.
   * @param newParserState
   */
  private handlePageEnd(pageText: string): string {
    const closingTag = this.getClosingTag(false);

    return pageText + closingTag;
  }

  protected convert({
    top = 0,
    right = 0,
    bottom = 0,
    left = 0,
  }: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  } = {}): string {
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }
}

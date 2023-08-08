import Big from 'big.js';

import createHTMLRegex from '../../regexp/html.regexp';
import HTMLTransformerOptions from '../../transformers/html/html-transformer-options.interface';
import HTMLTransformer from '../../transformers/html/html.transformer';
import Transformer from '../../transformers/models/transformer.interface';
import BigUtils from '../../utils/big';
import IWordWidthCalculator from '../../word-width-calculator.interface';
import CreateLineBreakParserConfig from '../default-line-break/create-line-break-parser-config.interface';
import DefaultLineBreakParser from '../default-line-break/default-line-break.parser';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParserState from '../models/parser-state.interface';
import Parser from '../models/parser.interface';
import parseEnd from '../word-parsers/end.parser';
import createNewlineParser from '../word-parsers/newline/newline.parser';
import pageOverflowParser from '../word-parsers/page-overflow.parser';
import AllowedTags from './allowed-tags.const';
import { BlockStyles } from './block-styles.interface';
import extractStyles from './extract-styles.function';
import { FontStyles } from './font-styles.interface';
import getMargin from './get-margin.function';
import WhiteSpaceValues from './white-space-values.enum';

/**
 * The context of the parser.
 * Contains information on the styles in the parser's allowlist, used for parsing.
 */
interface ParserContext {
  pageWidth: number;
  lineHeight: Big;

  blockStyles?: BlockStyles;
  fontStyles?: FontStyles;
  /**
   * Describes an HTML tag found in the text.
   */
  tag?: {
    opening: string;
    name: string;
  };
}

/**
 * Text content with information on the HTML tag, if any.
 */
interface Token {
  /** String content only. */
  content: string;

  /** Information on the tag if the text is nested in an HTML tag. */
  tag?: {
    name: string;
    opening: string;
    closing: string;
  };
}

export default class HTMLParser implements Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly.
   */
  public debug: CreateTextParserConfig;

  /**
   * Tags that HTMLParser recognizes.
   */
  private static readonly allowedTags = AllowedTags;

  private readonly parsePageOverflowFromLineHeightChange: (
    state: ParserState
  ) => ParserState;

  private htmlExpression: RegExp;

  private calculator: IWordWidthCalculator;
  private transformers: Array<Transformer> = [];

  /**
   * Line height for the whole book, given the font size configured.
   */
  private bookLineHeight: Big;

  constructor(
    private config: CreateTextParserConfig,
    private transformerOptions?: HTMLTransformerOptions,
    private context?: ParserContext
  ) {
    this.debug = config;

    this.parsePageOverflowFromLineHeightChange = pageOverflowParser(config);

    const htmlRegex = createHTMLRegex();
    this.htmlExpression = new RegExp(
      `${htmlRegex.source}`,
      htmlRegex.flags + 'd'
    );

    if (!this.context) {
      this.context = {
        pageWidth: this.config.pageWidth,
        lineHeight: Big(0),
        blockStyles: {
          margin: '0px',
        },
      };
    }
  }

  setCalculator(calculator: IWordWidthCalculator): void {
    this.calculator = calculator;

    if (this.context.fontStyles) {
      // Change the calculator from the parent if there are font styles.
      this.calculator.apply(this.context.fontStyles);
    }

    /*
     * This code will essentially break lines that are smaller than the default font size,
     * meaning it will overestimate and not fill out the page entirely.
     */
    this.bookLineHeight = this.context.lineHeight = Big(
      this.calculator.getCalculatedLineHeight()
    );
  }

  setTransformers(transformers: Array<Transformer>): void {
    this.transformers = transformers;
  }

  *generateParserStates(
    text: string,
    parserState?: ParserState,
    end = parseEnd
  ): Generator<ParserState> {
    // transform incompatible HTML tags into compatible ones using styling to match original behavior.
    text = new HTMLTransformer(
      {
        fontSize: this.config.fontSize,
      },
      this.transformerOptions
    ).transform(text);

    // transform text. Tell the transformers they are working with HTML.
    text = this.transformers.reduce((newText, transformer) => {
      transformer.forHTML = true;
      return transformer.transform(newText);
    }, text);

    const tokens = this.getTokens(text);

    if (!parserState) {
      // This denotes the top-level HTMLParser. Create the parser state.
      parserState = this.initializeParserState();

      yield parserState;
    } else {
      // This denotes a non-root HTMLParser.

      parserState = {
        ...parserState,
        lineHeight: this.bookLineHeight,
      };

      // If the change in font size causes the current line to overflow, set a new page.
      parserState = this.parsePageOverflowFromLineHeightChange(parserState);

      // Create an opening tag.
      parserState = this.openTag(parserState);

      yield parserState;
    }

    for (const token of tokens) {
      let generator: Generator<ParserState>;

      if (!token.tag) {
        const textContent = token.content;

        const whiteSpace = this.context.blockStyles?.['white-space'];
        const config: CreateLineBreakParserConfig = {
          ...this.config,
          /*
           * The default 'white-space' configuration ignores newlines
           * ( https://developer.mozilla.org/en-US/docs/Web/CSS/white-space#syntax )
           */
          ignoreNewline: !whiteSpace || whiteSpace === WhiteSpaceValues.NORMAL,
        };

        const parser = new DefaultLineBreakParser(config);

        parser.setCalculator(this.calculator);

        /*
         * Note the absence of a 'setTransformers' invocation.
         * The transformers act funny without the entire text.
         */

        generator = parser.generateParserStates(textContent, parserState, null);
      } else if (!token.tag.closing) {
        switch (token.tag.name) {
          case 'br':
            generator = this.parseBRTag(parserState, token.tag.opening);
            break;
          default:
            throw new Error(
              `Void-content tag ${token.tag.name} is not supported by HTMLParser. Please contact the code owner.`
            );
        }
      } else {
        const opening = token.tag.opening;
        const tagName = token.tag.name;
        const tagContent = token.content;

        const context = this.createParserContext(opening, tagName);

        const parser = new HTMLParser(
          this.config,
          this.transformerOptions,
          context
        );

        parser.setCalculator(this.calculator);
        parser.setTransformers(this.transformers);

        generator = parser.generateParserStates(tagContent, parserState, null);
      }

      let result: IteratorResult<ParserState>;

      while (!(result = generator.next()).done) {
        yield (parserState = this.handlePageEnd(parserState, result.value));
      }
    }

    parserState = this.endHTMLElement(parserState);

    parserState = end?.(parserState) ?? parserState;

    this.calculator.reset();

    yield parserState;
  }

  *generatePages(text: string): Generator<string> {
    const parserStates = this.generateParserStates(text);

    let parserState: ParserState;

    for (const newParserState of parserStates) {
      if (
        parserState &&
        newParserState.pages.length > parserState.pages.length
      ) {
        yield newParserState.pages.at(-1);
      }

      parserState = newParserState;
    }
  }

  /**
   * Generates tokens for the parser to analyze based on the given text.
   * Tokens consist of two types:
   * 1. Immediate HTML tags with info on the tags
   * 2. The content in-between HTML tags, treated as pure text.
   *
   * For example,
   * "foo<p>bar<br/></p>baz"
   * is handled as
   * - foo
   * - <p>bar<br/></p>
   * - baz
   */
  private *getTokens(text: string): Generator<Token> {
    let prev = 0;

    for (const html of text.matchAll(this.htmlExpression)) {
      const [begin, end] = html.indices[0];

      const textContent = text.slice(prev, begin);

      if (textContent) {
        yield {
          content: textContent,
        };
      }

      yield {
        content: html[3],

        tag: {
          opening: html[1],
          closing: html[4],
          name: html[2],
        },
      };

      prev = end;
    }

    const textContent = text.slice(prev);

    if (textContent) {
      yield {
        content: textContent,
      };
    }
  }

  private initializeParserState(): ParserState {
    return {
      pages: [],
      textIndex: 0,

      lines: [],
      pageHeight: Big(0),

      lineWidth: Big(0),
      lineHeight: this.bookLineHeight,
      lineText: '',
    };
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
    if (HTMLParser.allowedTags.includes(tagName)) {
      const { font: fontStyles, block: blockStyles } =
        extractStyles(tagOpening);

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
        // Choose the greater line height. Code breaks if the line height is smaller.
        lineHeight: BigUtils.max(
          this.bookLineHeight,
          Big(this.calculator.getCalculatedLineHeight())
        ),
      };
    } else {
      return this.context;
    }
  }

  private getOpeningTag(): string {
    const tag = this.context.tag;

    return tag?.opening ?? '';
  }

  private openTag(state: ParserState): ParserState {
    return {
      ...state,
      lineText: state.lineText + this.getOpeningTag(),
    };
  }

  private getClosingTag(): string {
    const tag = this.context.tag;

    if (tag) {
      return `</${tag.name}>`;
    } else {
      return '';
    }
  }

  private handlePageEnd(
    parserState: ParserState,
    newParserState: ParserState
  ): ParserState {
    if (newParserState.pages.length > parserState.pages.length) {
      const pages = [...newParserState.pages];
      pages[parserState.pages.length] += this.getClosingTag();

      const lines = [...newParserState.lines];
      lines[0] = this.getOpeningTag() + (newParserState.lines[0] ?? '');

      return {
        ...newParserState,
        pages,
        lines,
      };
    } else {
      return newParserState;
    }
  }

  /**
   * End a parsed HTMLElement, by adding the closing tag.
   */
  private endHTMLElement(parserState: ParserState): ParserState {
    const newParserState: ParserState = {
      ...parserState,
      // Add the closing tag if there is no remaining text content left.
      lineText: (parserState.lineText += this.getClosingTag()),
    };

    if (this.context.blockStyles) {
      // End the parsing of a block-level element by setting the parser on a newline.
      return createNewlineParser(newParserState, {
        text: '',
        width: Big(0),
      });
    } else {
      return newParserState;
    }
  }

  /**
   * <br> should be handled as a newline. QUESTION: Does it act as a newline in an inline element?
   */
  private *parseBRTag(
    parserState: ParserState,
    tagOpening: string
  ): Generator<ParserState> {
    yield createNewlineParser(parserState, {
      text: tagOpening,
      width: Big(0),
    });
  }
}

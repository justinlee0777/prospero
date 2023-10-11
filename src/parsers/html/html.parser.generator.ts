import Big from 'big.js';

import AllowedTags from '../../html/allowed-html/allowed-tags.const';
import extractStyles from '../../html/extract-styles/extract-styles.function';
import WhiteSpaceValues from '../../html/extract-styles/white-space-values.enum';
import getMargin from '../../html/get-margin/get-margin.function';
import HTMLTransformerOptions from '../../transformers/html/html-transformer-options.interface';
import HTMLTransformer from '../../transformers/html/html.transformer';
import Transformer from '../../transformers/models/transformer.interface';
import BigUtils from '../../utils/big';
import IWordWidthCalculator from '../../word-width-calculator.interface';
import CreateLineBreakParserConfig from '../default-line-break/create-line-break-parser-config.interface';
import DefaultLineBreakParser from '../default-line-break/default-line-break.parser';
import ChangeParserState from '../models/change-parser-state.interface';
import ParserGenerator from '../models/parser-generator.interface';
import ParserState from '../models/parser.state';
import ParsePageOverflow from '../word-parsers/page-overflow.parser';
import HTMLContext from './html-context.interface';
import { ParserContext } from './html-parser-constructor.interface';
import HTMLTokenizer, { Token, TokenType } from './html.tokenizer';
import ParseBlockElementClosing from './word-parsers/block-element-closing.parser';
import ParseBlockElementOpening from './word-parsers/block-element-opening.parser';
import ParseBRTag from './word-parsers/br-tag.parser';
import ParseHTMLElementClosing from './word-parsers/html-element-closing.parser';
import ParseHTMLElementOpening from './word-parsers/html-element-opening.parser';
import ChangeLineHeight from './word-parsers/line-height-change.parser';
import ParseHTMLPageOverflow from './word-parsers/parse-html-page-overflow.parser';

export default class HTMLParserGenerator
  implements ParserGenerator, HTMLContext
{
  done: boolean;
  value: ParserState;

  parsePageOverflow: ChangeParserState<void>;

  /**
   * Tags that HTMLParser recognizes.
   */
  private static readonly allowedTags = AllowedTags;

  private readonly tokens: IterableIterator<Token>;

  private readonly parseHTMLElementOpening: ChangeParserState<string>;
  private readonly parseHTMLElementClosing: ChangeParserState<string>;
  private readonly parseBlockElementOpening: ChangeParserState<string>;
  private readonly parseBlockElementClosing: ChangeParserState<string>;
  private readonly parseBRTag: ChangeParserState<string>;
  private readonly changeLineHeight: ChangeParserState<Big>;
  private readonly parsePageOverflowFromLineHeightChange: ChangeParserState<void>;

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

  /**
   * Generator only for text, NOT for HTML tags.
   */
  private textGenerator: ParserGenerator | null;

  constructor(
    text: string,
    private readonly tokenizer: HTMLTokenizer,
    private readonly config: CreateLineBreakParserConfig,
    private readonly wordWidthCalculator: IWordWidthCalculator,
    private readonly transformers: Array<Transformer> = [],
    private readonly transformerOptions?: HTMLTransformerOptions,
    initialState?: ParserState
  ) {
    // Initialize public generator-specific variables.
    this.done = false;

    if (initialState) {
      this.value = initialState;
    } else {
      this.value = new ParserState({
        pages: [],
        textIndex: 0,

        lines: [],
        pageHeight: Big(0),

        lineWidth: Big(0),
        lineHeight: Big(this.config.lineHeight),
        lineText: '',
      });
    }

    // Initialize changes in parser state.
    this.parsePageOverflow = new ParseHTMLPageOverflow(this);

    this.parseHTMLElementOpening = new ParseHTMLElementOpening();
    this.parseHTMLElementClosing = new ParseHTMLElementClosing();
    this.parseBlockElementOpening = new ParseBlockElementOpening();
    this.parseBlockElementClosing = new ParseBlockElementClosing();
    this.parseBRTag = new ParseBRTag();
    this.changeLineHeight = new ChangeLineHeight();
    this.parsePageOverflowFromLineHeightChange = new ParsePageOverflow();

    // Initialize the current HTML tree - as we have not read the tree yet, there is none.
    this.contexts = [
      {
        pageWidth: this.config.pageWidth,
        lineHeight: Big(0),
        blockStyles: {
          margin: '0px',
        },
      },
    ];

    // Break the text down into HTML tokens for future analysis.

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

    this.tokens = this.tokenizer.getTokens(text);
  }

  next(changedParserState?: ParserState): ParserState {
    let { value } = this;

    if (changedParserState) {
      value = changedParserState;
    }

    let match: IteratorResult<Token>;
    let token: Token;

    if (this.textGenerator) {
      value = this.nextText();
    } else if ((match = this.tokens.next()).done) {
      /*
       * If there are no more nodes to analyze - text nodes, HTML nodes, end-of-HTML nodes etc -
       * our generator is done. The current value is the last value.
       */
      this.done = true;
      return this.value;
    } else if ((token = match.value).type === TokenType.TEXT) {
      const textContent = token.content;

      let config: CreateLineBreakParserConfig = {
        ...this.config,
      };

      if (this.context.blockStyles) {
        const whiteSpace = this.context.blockStyles?.['white-space'];
        const pageWidth = this.context.pageWidth;

        config = {
          ...config,
          /*
           * The default 'white-space' configuration ignores newlines
           * ( https://developer.mozilla.org/en-US/docs/Web/CSS/white-space#syntax )
           */
          ignoreNewline: !whiteSpace || whiteSpace === WhiteSpaceValues.NORMAL,
          pageWidth,
        };
      }

      const parser = new DefaultLineBreakParser(config);

      parser.setCalculator(this.wordWidthCalculator);

      /*
       * Note the absence of a 'setTransformers' invocation.
       * The transformers act funny without the entire text.
       */

      this.textGenerator = parser.createGenerator(textContent, value);
      // Override how the generator handles page overflows.
      this.textGenerator.parsePageOverflow = this.parsePageOverflow;

      value = this.nextText();
    } else if (token.type === TokenType.HTML) {
      if (!HTMLParserGenerator.allowedTags.includes(token.tag.name)) {
        // If the tag is not allowed, discard this tag and read from the next token.
        return this.next(changedParserState);
      } else if (token.tag.closing) {
        const opening = token.tag.opening;
        const tagName = token.tag.name;

        const context = this.createParserContext(opening, tagName);

        this.contexts.push(context);

        this.updateCalculator();

        const tagOpening = this.getOpeningTag();

        if (this.context.blockStyles) {
          // Create an opening tag.
          value = this.parseBlockElementOpening.parse(value, tagOpening);
        } else {
          value = this.parseHTMLElementOpening.parse(value, tagOpening);
        }
        value = this.changeLineHeight.parse(
          value,
          BigUtils.max(
            Big(value.initial.lineHeight),
            Big(this.wordWidthCalculator.getCalculatedLineHeight())
          )
        );

        const { pageHeight, lineHeight } = value.initial;
        if (pageHeight.add(lineHeight).gte(this.config.pageHeight)) {
          value = this.parsePageOverflowFromLineHeightChange.parse(value);
        }
      } else {
        switch (token.tag.name) {
          case 'br':
            value = this.parseBRTag.parse(value, token.tag.opening);
            break;
          default:
            console.error(
              `Void-content tag '${token.tag.name}' is not supported by HTMLParser. Please contact the code owner.`
            );
        }
      }
    } else if (token.type === TokenType.END_HTML) {
      if (!HTMLParserGenerator.allowedTags.includes(token.tagName)) {
        // If the tag is not allowed, discard this tag and read from the next token.
        return this.next(changedParserState);
      } else {
        if (this.context.blockStyles) {
          value = this.parseBlockElementClosing.parse(
            value,
            this.getClosingTag()
          );
        } else {
          value = this.parseHTMLElementClosing.parse(
            value,
            this.getClosingTag()
          );
        }

        this.contexts.pop();

        this.updateCalculator();
        value = this.changeLineHeight.parse(
          value,
          Big(this.wordWidthCalculator.getCalculatedLineHeight())
        );

        const { pageHeight, lineHeight } = value.initial;
        if (pageHeight.add(lineHeight).gte(this.config.pageHeight)) {
          value = this.parsePageOverflowFromLineHeightChange.parse(value);
        }
      }
    }

    if (value === null) {
      this.textGenerator = null;
      return this.next(changedParserState);
    } else {
      this.value = value;
      return value;
    }
  }

  /**
   * Gets the opening tag of the current HTML tag or the entire tree.
   * @param last denotes whether to get the current HTML tag or the entire chain.
   */
  getOpeningTag(last = true): string {
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
  getClosingTag(last = true): string {
    const contexts = last ? [this.context] : this.contexts.slice().reverse();

    return contexts.reduce(
      (tag, context) => (tag += context.tag ? `</${context.tag.name}>` : ''),
      ''
    );
  }

  private nextText(): ParserState | null {
    const { textGenerator } = this;

    if (!textGenerator) {
      throw new Error(
        'There is no current ParserGenerator to get text tokens from.'
      );
    }

    if (textGenerator.done) {
      return null;
    } else {
      return textGenerator.next(this.value);
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
    if (HTMLParserGenerator.allowedTags.includes(tagName)) {
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
          Big(this.config.lineHeight),
          Big(this.wordWidthCalculator.getCalculatedLineHeight())
        ),
      };
    } else {
      return this.context;
    }
  }

  /**
   * Update the WordWidthCalculator when a context is pushed or popped.
   * The deepest context with a change in font styles is used.
   * If no context is found, then the calculator resets to its default configuration.
   */
  private updateCalculator(): void {
    const context = this.contexts
      .slice()
      .reverse()
      .find((c) => Boolean(c.fontStyles));

    if (context) {
      this.wordWidthCalculator.apply(context.fontStyles);
    } else {
      this.wordWidthCalculator.reset();
    }
  }
}

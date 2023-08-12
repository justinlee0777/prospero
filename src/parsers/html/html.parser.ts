import Big from 'big.js';

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
import extractStyles from './extract-styles.function';
import getMargin from './get-margin.function';
import HTMLParserConstructor, {
  ParserContext,
} from './html-parser-constructor.interface';
import HTMLTokenizer, { TokenType } from './html.tokenizer';
import WhiteSpaceValues from './white-space-values.enum';

export default function HTMLParser(Tokenizer: {
  new (): HTMLTokenizer;
}): HTMLParserConstructor {
  return class HTMLParser implements Parser {
    /**
     * This is used to debug the parser. Beware if you use this directly.
     */
    public debug: CreateTextParserConfig;

    /**
     * Tags that HTMLParser recognizes.
     */
    private static readonly allowedTags = AllowedTags;

    private readonly tokenizer = new Tokenizer();

    private readonly parsePageOverflowFromLineHeightChange: (
      state: ParserState
    ) => ParserState;

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

    private calculator: IWordWidthCalculator;
    private transformers: Array<Transformer> = [];

    /**
     * Line height for the whole book, given the font size configured.
     */
    private bookLineHeight: Big;

    constructor(
      private config: CreateTextParserConfig,
      private transformerOptions?: HTMLTransformerOptions
    ) {
      this.debug = config;

      this.parsePageOverflowFromLineHeightChange = pageOverflowParser(config);

      this.contexts = [
        {
          pageWidth: this.config.pageWidth,
          lineHeight: Big(0),
          blockStyles: {
            margin: '0px',
          },
        },
      ];
    }

    setCalculator(calculator: IWordWidthCalculator): void {
      this.calculator = calculator;

      /*
       * This code will essentially break lines that are smaller than the default font size,
       * meaning it will overestimate and not fill out the page entirely.
       */
      this.bookLineHeight = Big(this.calculator.getCalculatedLineHeight());
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

      const tokens = this.tokenizer.getTokens(text);

      let initial: ParserState;

      if (!parserState) {
        // This denotes the top-level HTMLParser. Create the parser state.
        parserState = initial = this.initializeParserState();

        yield parserState;
      }

      for (const token of tokens) {
        if (token.type === TokenType.TEXT) {
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
              ignoreNewline:
                !whiteSpace || whiteSpace === WhiteSpaceValues.NORMAL,
              pageWidth,
            };
          }

          const parser = new DefaultLineBreakParser(config);

          parser.setCalculator(this.calculator);

          /*
           * Note the absence of a 'setTransformers' invocation.
           * The transformers act funny without the entire text.
           */

          const generator = parser.generateParserStates(
            textContent,
            parserState,
            null
          );

          let result: IteratorResult<ParserState>;

          while (!(result = generator.next()).done) {
            yield (parserState = this.handlePageEnd(initial, result.value));
          }
        } else if (token.type === TokenType.HTML) {
          if (!HTMLParser.allowedTags.includes(token.tag.name)) {
            continue;
          }

          if (token.tag.closing) {
            const opening = token.tag.opening;
            const tagName = token.tag.name;

            const context = this.createParserContext(opening, tagName);

            this.contexts.push(context);

            parserState = this.updateCalculator(parserState);

            // If the change in font size causes the current line to overflow, set a new page.
            parserState =
              this.parsePageOverflowFromLineHeightChange(parserState);

            // Create an opening tag.
            yield (parserState = this.openTag(parserState));
          } else {
            switch (token.tag.name) {
              case 'br':
                yield (parserState = this.parseBRTag(
                  parserState,
                  token.tag.opening
                ));
                break;
              default:
                console.error(
                  `Void-content tag '${token.tag.name}' is not supported by HTMLParser. Please contact the code owner.`
                );
            }
          }
        } else if (token.type === TokenType.END_HTML) {
          if (!HTMLParser.allowedTags.includes(token.tagName)) {
            continue;
          }

          yield (parserState = this.endHTMLElement(parserState));

          this.contexts.pop();

          parserState = this.updateCalculator(parserState);
        }

        initial = parserState;
      }

      parserState = end?.(parserState) ?? parserState;

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

    /**
     * Update the WordWidthCalculator when a context is pushed or popped.
     * The deepest context with a change in font styles is used.
     * If no context is found, then the calculator resets to its default configuration.
     */
    private updateCalculator(parserState: ParserState): ParserState {
      const context = this.contexts
        .slice()
        .reverse()
        .find((c) => Boolean(c.fontStyles));

      if (context) {
        this.calculator.apply(context.fontStyles);
      } else {
        this.calculator.reset();
      }

      return {
        ...parserState,
        lineHeight: BigUtils.max(
          this.bookLineHeight,
          Big(this.calculator.getCalculatedLineHeight())
        ),
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

    private openTag(state: ParserState): ParserState {
      return {
        ...state,
        lineText: state.lineText + this.getOpeningTag(),
      };
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
    private handlePageEnd(
      initialState: ParserState,
      newParserState: ParserState
    ): ParserState {
      const initialLength = initialState.pages.length;
      const diff = newParserState.pages.length - initialLength;

      const closingTag = this.getClosingTag(false);
      const openingTag = this.getOpeningTag(false);

      if (diff > 0) {
        const pages = [...newParserState.pages];

        for (let i = 0; i < diff; i++) {
          pages[initialLength + i] += closingTag;
        }

        // This modification is for the current page.
        const lines = [...newParserState.lines];
        lines[0] = openingTag + (newParserState.lines[0] ?? '');

        // These modifications are for pages between the current page and the initial page.
        for (let i = 0; i < diff - 1; i++) {
          pages[initialLength + i] = openingTag + pages[initialLength + i];
        }

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

      if (this.context.blockStyles && newParserState.lineWidth.gt(0)) {
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
    private parseBRTag(
      parserState: ParserState,
      tagOpening: string
    ): ParserState {
      return createNewlineParser(parserState, {
        text: tagOpening,
        width: Big(0),
      });
    }
  };
}

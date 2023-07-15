import Big from 'big.js';

import createHTMLRegex from '../../regexp/html.regexp';
import HTMLTransformerOptions from '../../transformers/html/html-transformer-options.interface';
import HTMLTransformer from '../../transformers/html/html.transformer';
import BigUtils from '../../utils/big';
import DefaultLineBreakParser from '../default-line-break/default-line-break.parser';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParserState from '../models/parser-state.interface';
import Word from '../models/word.interface';
import pageOverflowParser from '../word-parsers/page-overflow.parser';
import AllowedTags from './allowed-tags.const';
import extractStyles from './extract-styles.function';
import getMargin from './get-margin.function';

/**
 * Describes an HTML tag found in the text.
 */
interface ParserContextTag {
  opening: string;
  name: string;
  lineHeight: Big;
}

/**
 * The context of the parser - there are really two types only:
 * 1. the entire text
 * 2. HTML tags
 */
interface ParserContext {
  /** Use to get the words within the text or the current HTML tag. */
  content: IterableIterator<RegExpMatchArray>;
  pageWidth: number;

  tag?: ParserContextTag;
}

export default class HTMLParser extends DefaultLineBreakParser {
  private readonly allowedTags = AllowedTags;

  /**
   * The 0th-element is the current context.
   */
  private queue: Array<ParserContext>;

  constructor(
    config: CreateTextParserConfig,
    private transformerOptions?: HTMLTransformerOptions
  ) {
    super(config);

    this.tokenExpression = new RegExp(
      `${createHTMLRegex().source}|${this.tokenExpression.source}`,
      this.tokenExpression.flags
    );
  }

  *generateParserStates(text: string): Generator<ParserState> {
    // transform incompatible HTML tags into compatible ones using styling to match original behavior.
    text = new HTMLTransformer(
      {
        fontSize: this.config.fontSize,
      },
      this.transformerOptions
    ).transform(text);

    text = this.transformText(text);

    this.queue = [
      {
        content: text.matchAll(this.tokenExpression),
        pageWidth: this.pageWidth,
      },
    ];

    const calculateWordWidth = (word) => this.calculator.calculate(word);

    let parserState = this.initializeParserState();

    yield parserState;

    let token: RegExpMatchArray;

    while ((token = this.getNext(parserState))) {
      const { groups } = token;

      /*
       * Not the best way of identifying the HTML tag, but named capture groups seem to break
       * with nested capture groups
       */
      const htmlExpression =
        token.filter((group) => Boolean(group)).length === 4;

      if (htmlExpression) {
        /*
         * If an HTML expression, set the program to the HTML context:
         * parse the HTML context and tell the program to add opening and closing tags in certain places.
         */
        const opening = token.at(1);
        const tagName = token.at(2);
        const tagContent = token.at(3);

        const context: ParserContext = {
          content: tagContent.matchAll(this.tokenExpression),
          // Take the page width of the current context
          pageWidth: this.queue.at(0).pageWidth,
        };

        // Create a new context from the HTML content, regardless if the tag is used or not.
        this.queue.unshift(context);

        // Only process allowed tags.
        if (this.allowedTags.includes(tagName)) {
          const { font: fontStyles, block: blockStyle } =
            extractStyles(opening);
          if (fontStyles) {
            // Adjust the current word-width calculator to take into account font size and weight.
            this.calculator.apply(fontStyles);
          }

          if (blockStyle) {
            const { margin } = blockStyle;
            if (margin) {
              const marginValues = getMargin(margin);
              // Only acknowledging left and right for the time being.
              context.pageWidth -= marginValues.left + marginValues.right;

              this.pageWidth = context.pageWidth;
            }
          }

          context.tag = {
            opening,
            name: tagName,
            // Choose the greater line height. Code breaks if the line height is smaller.
            lineHeight: BigUtils.max(
              this.bookLineHeight,
              Big(this.calculator.getCalculatedLineHeight())
            ),
          };

          parserState = {
            ...parserState,
            /*
             * This code will essentially break lines that are smaller than the default font size,
             * meaning it will overestimate and not fill out the page entirely.
             */
            lineHeight: BigUtils.max(
              this.bookLineHeight,
              Big(this.calculator.getCalculatedLineHeight())
            ),
          };

          // If the change in font size causes the current line to overflow, set a new page.
          parserState = this.parsePageOverflowFromLineHeightChange(parserState);

          // Create an opening tag.
          parserState = this.openTag(parserState);
        }

        /*
         * There is no content to parse (the tags are not treated directly as content).
         * Continue the program using the current HTML tag as content.
         */
        continue;
      }

      const word = token.at(0);

      const wordDescription = this.getWordDescription(
        parserState,
        Boolean(groups['newline']),
        Boolean(groups['whitespace']),
        word,
        calculateWordWidth
      );

      const parseText = this.chooseWordParser(wordDescription);

      parserState = parseText(parserState, wordDescription.word);

      parserState = this.parsePageOverflow(parserState);

      yield parserState;
    }

    parserState = this.parseEnd(parserState);

    yield parserState;
  }

  /**
   * @param parserState is only passed so this function can alter its state, as it knows when tags are closed.
   *  Possibly a break in encapsulation.
   * @returns the next token - either from the original text or a nested HTML tag - or 'null', if
   * there are no tokens left.
   */
  private getNext(parserState: ParserState): RegExpMatchArray | null {
    if (this.queue.length === 0) {
      return null;
    }

    const iterator = this.queue.at(0);
    const next = iterator.content.next();

    if (next.done) {
      // Add the closing tag if there is no remaining text content left.
      parserState.lineText += this.getCurrentClosingTag();

      this.calculator.reset();

      this.queue = this.queue.slice(1);

      // Reset the page width of the current context.
      this.pageWidth = this.queue.at(0)?.pageWidth ?? 0;

      return this.getNext(parserState);
    } else {
      return next.value;
    }
  }

  protected parseNewline = function (
    state: ParserState,
    word: Word
  ): ParserState {
    return {
      ...state,
      textIndex: state.textIndex + word.text.length,
      // Cut the current text and begin on a newline.
      lines: state.lines.concat(state.lineText + word.text),
      pageHeight: state.pageHeight.add(state.lineHeight),
      // Choose the current tag's line height over the default line height, if it is continued on the next line
      lineHeight: this.tag?.lineHeight ?? this.bookLineHeight,
      lineWidth: Big(0),
      lineText: '',
    };
  };

  protected parseWhitespaceAtTextOverflow = function (
    state: ParserState,
    word: Word
  ): ParserState {
    return {
      ...state,
      textIndex: state.textIndex + word.text.length,
      // Cut the current text and begin on a newline.
      lines: state.lines.concat(state.lineText),
      pageHeight: state.pageHeight.add(state.lineHeight),
      // Choose the current tag's line height over the default line height, if it is continued on the next line
      lineHeight: this.tag?.lineHeight ?? this.bookLineHeight,
      lineWidth: Big(0),
      lineText: word.text,
    };
  };

  protected parseWordAtTextOverflow = function (
    state: ParserState,
    word: Word
  ): ParserState {
    return {
      ...state,
      textIndex: state.textIndex + word.text.length,
      // Cut the current text and begin on a newline.
      lines: state.lines.concat(state.lineText),
      pageHeight: state.pageHeight.add(state.lineHeight),
      // Choose the current tag's line height over the default line height, if it is continued on the next line
      lineHeight: this.tag?.lineHeight ?? this.bookLineHeight,
      lineWidth: word.width,
      lineText: word.text,
    };
  };

  /**
   * Overriding original page overflow parser to make sure the opening tag is applied on a new page.
   */
  protected parsePageOverflow = function (
    this: HTMLParser,
    state: ParserState
  ) {
    if (state.pageHeight.add(state.lineHeight).gte(this.config.pageHeight)) {
      return {
        ...state,
        pages: state.pages.concat(
          state.lines.join('') + this.getFullClosingTag()
        ),
        // Cut the current text and begin on a newline.
        lines: [],
        pageHeight: Big(0),
        lineText: this.getFullOpeningTag() + state.lineText,
      };
    } else {
      return state;
    }
  };

  private parsePageOverflowFromLineHeightChange = pageOverflowParser(
    this.config
  );

  private getCurrentOpeningTag(): string {
    const tagContext = this.queue.find((context) => Boolean(context.tag));

    return tagContext?.tag.opening ?? '';
  }

  private openTag(state: ParserState): ParserState {
    return {
      ...state,
      lineText: state.lineText + this.getCurrentOpeningTag(),
    };
  }

  private getCurrentClosingTag(): string {
    const tagContext = this.queue.find((context) => Boolean(context.tag));

    if (tagContext) {
      return `</${tagContext.tag.name}>`;
    } else {
      return '';
    }
  }

  /**
   * Used when new pages are started and contexts are carried over.
   */
  private getFullOpeningTag(): string {
    // Works backwards as the 0th context is the current context, and thus later ones are parent tags.
    return this.queue.reduceRight((acc, context) => {
      if (context.tag) {
        return acc + context.tag.opening;
      } else {
        return acc;
      }
    }, '');
  }

  /**
   * Used when pages are ending and contexts have not closed yet.
   */
  private getFullClosingTag(): string {
    return this.queue.reduce((acc, context) => {
      if (context.tag) {
        return acc + `</${context.tag.name}>`;
      } else {
        return acc;
      }
    }, '');
  }
}

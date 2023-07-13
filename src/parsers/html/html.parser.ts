import Big from 'big.js';

import createHTMLRegex from '../../regexp/html.regexp';
import blockLevelTags from '../../sanitizers/html/block-level-tags.const';
import Sanitizer from '../../sanitizers/sanitizer.interface';
import HTMLTransformerOptions from '../../transformers/html/html-transformer-options.interface';
import HTMLTransformer from '../../transformers/html/html.transformer';
import BigUtils from '../../utils/big';
import Constructor from '../../utils/constructor.type';
import DefaultLineBreakParser from '../default-line-break/default-line-break.parser';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParserState from '../models/parser-state.interface';
import Parser from '../models/parser.interface';
import Word from '../models/word.interface';
import pageOverflowParser from '../word-parsers/page-overflow.parser';
import extractStyles from './extract-styles.function';
import getMargin from './get-margin.function';

export default function HTMLParser(
  HTMLSanitizer: new () => Sanitizer
): Constructor<Parser, [CreateTextParserConfig]> {
  return class HTMLParser extends DefaultLineBreakParser {
    private readonly blockLevelTags = blockLevelTags;

    /**
     * The last element will always be the original text content.
     * The first element will be either the original text content or an HTML element.
     * The parser currently is not expected to handle nested HTML tags - thus elements are only one - level deep.
     * Thus there are always only 0 - 2 elements in the array.
     */
    private iteratorQueue: Array<IterableIterator<RegExpMatchArray>>;
    private tag: {
      opening: string;
      name: string;
      remainingTextContentLength: number;
      lineHeight: Big;
    } | null;

    /**
     * Caching the original page width calculated from page styles.
     * We will be adjusting the page width based on the block-level element being analyzed at the moment.
     */
    private originalPageWidth: number;

    constructor(
      config: CreateTextParserConfig,
      private transformerOptions?: HTMLTransformerOptions
    ) {
      super(config);

      this.originalPageWidth = this.pageWidth;

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

      // remove completely incompatible HTML tags.
      text = new HTMLSanitizer().sanitize(text);

      this.iteratorQueue = [text.matchAll(this.tokenExpression)];

      const calculateWordWidth = (word) => this.calculator.calculate(word);

      let parserState = this.initializeParserState();

      yield parserState;

      let token: RegExpMatchArray;

      while ((token = this.getNext())) {
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
          const tagContent = token.at(3);

          this.iteratorQueue.unshift(tagContent.matchAll(this.tokenExpression));

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
              this.pageWidth -= marginValues.left + marginValues.right;
            }
          }

          this.tag = {
            opening,
            name: token.at(2),
            // Use the size of the text content within the HTML to determine when to end the HTML tag.
            remainingTextContentLength: tagContent.length,
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

        /*
         * Old note: This is wrong. It is possible to transform only part of a word.
         * This considers the entire word.
         * I don't know what use case that would fulfill, however.
         *
         * New note: This actually does work, having observed the ping.txt. I forgot the
         * HTML regex creates its own context and cuts into words properly.
         * Who was it that said that good (in this case, decent) code can exhibit surprising behavior?
         */
        this.tag && (this.tag.remainingTextContentLength -= word.length);

        // Add the closing tag if there is no remaining text content left.
        wordDescription.word.text += this.getClosingTag();

        const parseText = this.chooseWordParser(wordDescription);

        parserState = parseText(parserState, wordDescription.word);

        if (this.shouldCloseTag()) {
          // If there is no remaining text content left, remove the tag context and reset the calculator.
          this.tag = null;

          // Reset the page width to the natural width of the container.
          this.pageWidth = this.originalPageWidth;

          this.calculator.reset();
        }

        parserState = this.parsePageOverflow(parserState);

        yield parserState;
      }

      parserState = this.parseEnd(parserState);

      yield parserState;
    }

    /**
     * @returns the next token - either from the original text or a nested HTML tag - or 'null', if
     * there are no tokens left.
     */
    private getNext(): RegExpMatchArray | null {
      if (this.iteratorQueue.length === 0) {
        return null;
      }

      const iterator = this.iteratorQueue.at(0);
      const next = iterator.next();

      if (next.done) {
        this.iteratorQueue = this.iteratorQueue.slice(1);

        return this.getNext();
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
    protected parsePageOverflow = function (state: ParserState) {
      if (state.pageHeight.add(state.lineHeight).gte(this.config.pageHeight)) {
        return {
          ...state,
          pages: state.pages.concat(state.lines.join('')),
          // Cut the current text and begin on a newline.
          lines: [],
          pageHeight: Big(0),
          lineText: this.getOpeningTag() + state.lineText,
        };
      } else {
        return state;
      }
    };

    private parsePageOverflowFromLineHeightChange = pageOverflowParser(
      this.config
    );

    private getOpeningTag(): string {
      return this.tag?.opening ?? '';
    }

    private openTag(state: ParserState): ParserState {
      return {
        ...state,
        lineText: state.lineText + this.getOpeningTag(),
      };
    }

    private shouldCloseTag(): boolean {
      return this.tag?.remainingTextContentLength <= 0 ?? false;
    }

    private getClosingTag(): string {
      if (this.shouldCloseTag()) {
        return `</${this.tag.name}>`;
      } else {
        return '';
      }
    }
  };
}

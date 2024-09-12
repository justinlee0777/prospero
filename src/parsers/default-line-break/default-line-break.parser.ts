import { dash, newline, whitespace } from '../../glyphs.const';
import Transformer from '../../transformers/models/transformer.interface';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParserState from '../models/parser-state.interface';
import Parser from '../models/parser.interface';
import Word from '../models/word.interface';
import CreateLineBreakParserConfig from './create-line-break-parser-config.interface';
import div from '../../elements/div.function';

/**
 * Describes the effect a word has on a page.
 */
interface WordDescription {
  isNewline: boolean;
  isWhitespace: boolean;
  isBeginningOfPage: boolean;
  causesWordOverflow: boolean;
  word: Word;
}

export default class DefaultLineBreakParser implements Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly.
   */
  public debug: CreateTextParserConfig;

  protected tokenExpression: RegExp;

  protected transformers: Array<Transformer> = [];

  constructor(protected config: CreateLineBreakParserConfig) {
    this.debug = config;

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
    let expressions = [
      `(?<word>${characterExpression})`,
      `(?<whitespace>${whitespaceExpression})`,
    ];

    if (!config.ignoreNewline) {
      expressions = expressions.concat(`(?<newline>${newlineExpression})`);
    }

    this.tokenExpression = new RegExp(expressions.join('|'), 'g');
  }

  setTransformers(transformers: Array<Transformer>): void {
    this.transformers = transformers;
  }

  *generateParserStates(
    text: string
  ): Generator<string> {
    text = this.transformText(text);

    const { pageStyles } = this.config;

    const textElement = div();

    const styles: Partial<CSSStyleDeclaration> = {
      boxSizing: 'border-box',
      fontFamily: pageStyles.computedFontFamily,
      fontSize: pageStyles.computedFontSize,
      lineHeight: `${pageStyles.lineHeight}px`,
      padding: this.convert(pageStyles.padding),
      border: this.convert(pageStyles.border),
      margin: this.convert(pageStyles.margin),
      height: `${pageStyles.height}px`,
      width: `${pageStyles.width}px`,
    position: 'absolute',
    left: '-99in',
      whiteSpace: 'pre-wrap',
    }

    const page = div({
      styles,
      children: [textElement],
    });

    document.body.appendChild(page);

    const tokens = text.matchAll(this.tokenExpression);

    /*
    if (!parserState) {
      parserState = this.initializeParserState();

      yield parserState;
    }
    */

    const computedStyles = getComputedStyle(page);
    const pageHeight = page.clientHeight - parseFloat(computedStyles.paddingTop) - parseFloat(computedStyles.paddingBottom);
    console.log({
      styles,
      pageHeight,
      computedStyles,
    })
    let pageText = '';

    for (const token of tokens) {
      const [ word ] = token;

      const newPageText = pageText + word;

      textElement.textContent = newPageText;
      console.log({
        pageText,
        clientHeight: textElement.clientHeight,
      })
      if (textElement.clientHeight >= pageHeight) {
        yield pageText;

        pageText = word;
      } else {
        pageText = newPageText;
      }
    }

    // parserState = end?.(parserState) ?? parserState;

    document.body.removeChild(page);

    yield pageText;
  }

  *generatePages(text: string): Generator<string> {
    const parserStates = this.generateParserStates(text);

    let parserState: ParserState;

    for (const newParserState of parserStates) {
      yield newParserState;
    }
  }

  protected convert({ top = 0, right = 0, bottom = 0, left = 0 }: { top?: number; right?: number; bottom?: number; left?: number } = {}): string {
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }

  protected transformText(text: string): string {
    return this.transformers.reduce((newText, transformer) => {
      transformer.forHTML = false;
      return transformer.transform(newText);
    }, text);
  }
}

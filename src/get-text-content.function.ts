import Big from 'big.js';

import ContainerStyle from './container-style.interface';
import getNormalizedPageHeight from './get-normalized-page-height.function';
import { tokenExpression } from './glyphs.const';
import getWordWidth from './get-word-width.function';
import { DefaultLinkBreakParser } from './parsers/default-line-break/default-line-break.parser';
import ParserState from './parsers/models/parser-state.interface';
import Word from './parsers/models/word.interface';
import ParseWord from './parsers/models/parse-word.interface';

export default function* getTextContent(
  {
    width,
    height,
    computedFontFamily,
    computedFontSize,
    lineHeight,
    padding,
    margin,
    border,
    textIndent = '',
  }: ContainerStyle,
  textContent: string
): Generator<string> {
  const containerWidth =
    width -
    padding.left -
    padding.right -
    margin.left -
    margin.right -
    border.left -
    border.right;

  const pageHeight = getNormalizedPageHeight(
    height -
    padding.top -
    padding.bottom -
    margin.top -
    margin.bottom -
    border.top -
    border.bottom,
    lineHeight
  );

  const numLines = pageHeight / lineHeight;

  const tokens = textContent.matchAll(tokenExpression);

  const calculateWordWidth = getWordWidth(computedFontSize, computedFontFamily);

  const textIndentWidth = calculateWordWidth(textIndent);

  const parser = new DefaultLinkBreakParser({
    textIndent: {
      text: textIndent,
      width: Big(textIndentWidth),
    },
    pageLines: numLines,
  });

  let parserState: ParserState = {
    pages: [],

    lines: [],

    lineWidth: Big(textIndentWidth),
    line: 0,
    lineText: textIndent,
  };

  for (const token of tokens) {
    const { 0: word, groups } = token;

    const newlineExpression = Boolean(groups['newline']);
    const whitespaceExpression = Boolean(groups['whitespace']);

    const wordWidth = Big(calculateWordWidth(word)).round(2, 0);

    const pageBeginning = parserState.line === 0 && parserState.lineWidth.eq(0);
    const wordOverflows = parserState.lineWidth
      .plus(wordWidth)
      .gte(containerWidth);

    let parseText: ParseWord;

    if (newlineExpression) {
      if (pageBeginning) {
        parseText = parser.parseNewlineAtPageBeginning;
      } else {
        parseText = parser.parseNewline;
      }
    } else if (whitespaceExpression) {
      if (wordOverflows) {
        parseText = parser.parseWhitespaceAtTextOverflow;
      } else if (pageBeginning) {
        parseText = parser.parseWhitespaceAtPageBeginning;
      } else {
        parseText = parser.parseWhitespaceInline;
      }
    } else {
      if (wordOverflows) {
        parseText = parser.parseWordAtTextOverflow;
      } else {
        parseText = parser.parseWord;
      }
    }

    const wordState: Word = {
      text: word,
      width: wordWidth,
    };

    const newParserState = parseText(parserState, wordState);

    if (newParserState.pages.length > parserState.pages.length) {
      yield newParserState.pages[newParserState.pages.length - 1];
    }

    parserState = newParserState;
  }

  if (parserState.lines.length > 0) {
    yield [...parserState.lines, parserState.lineText].join('');
  }
}

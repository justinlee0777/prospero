import Big from 'big.js';

import ContainerStyle from './container-style.interface';
import getNormalizedPageHeight from './get-normalized-page-height.function';
import { tokenExpression } from './glyphs.const';
import getWordWidth from './get-word-width.function';

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

  let currentLineWidth = Big(textIndentWidth);
  let currentLine = 0;
  let currentLineText = textIndent;
  let lines: Array<string> = [];

  for (const token of tokens) {
    const { 0: word, groups } = token;

    const newlineExpression = Boolean(groups['newline']);
    const whitespaceExpression = Boolean(groups['whitespace']);

    const wordWidth = Big(calculateWordWidth(word)).round(2, 0);

    const pageBeginning = currentLine === 0 && currentLineWidth.eq(0);
    const wordOverflows = currentLineWidth.plus(wordWidth).gte(containerWidth);

    let newLine: number;
    let newLineWidth: Big;
    let newLineText: string;

    if (newlineExpression) {
      if (pageBeginning) {
        // Ignore any newlines for new pages.
        newLine = currentLine;
        newLineWidth = Big(textIndentWidth);
        newLineText = textIndent;
      } else {
        // Cut the current text and begin on a newline.
        lines = lines.concat(currentLineText + word);

        newLine = currentLine + 1;
        newLineWidth = Big(textIndentWidth);
        newLineText = textIndent;
      }
    } else if (whitespaceExpression) {
      if (wordOverflows) {
        lines = lines.concat(currentLineText);

        newLine = currentLine + 1;
        newLineWidth = Big(0);
        newLineText = word;
      } else if (pageBeginning) {
        newLine = currentLine;
        newLineWidth = currentLineWidth;
        newLineText = currentLineText;
      } else {
        newLine = currentLine;
        newLineWidth = currentLineWidth.plus(wordWidth);
        newLineText = currentLineText + word;
      }
    } else {
      if (wordOverflows) {
        lines = lines.concat(currentLineText);

        newLine = currentLine + 1;
        newLineWidth = wordWidth;
        newLineText = word;
      } else {
        newLine = currentLine;
        newLineWidth = currentLineWidth.plus(wordWidth);
        newLineText = currentLineText + word;
      }
    }

    if (newLine === numLines) {
      yield lines.join('');

      lines = [];
      newLine = 0;
      newLineText = newLineText.trim();
    }

    currentLine = newLine;
    currentLineWidth = newLineWidth;
    currentLineText = newLineText;
  }

  if (lines.length > 0) {
    yield [...lines, currentLineText].join('');
  }
}

import ContainerStyle from './container-style.interface';
import getCharacterWidths from './get-character-widths.function';
import getNormalizedPageHeight from './get-normalized-page-height.function';
import { tokenExpression } from './glyphs.const';
import { formatVariables } from './utils/debug/format-variables.function';

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
  const characterToWidth = getCharacterWidths(
    computedFontSize,
    computedFontFamily
  );

  const numLines = pageHeight / lineHeight;

  const tokens = textContent.matchAll(tokenExpression);

  let currentLineWidth = 0;
  let currentLine = 0;
  let currentLineText = '';
  let lines: Array<string> = [];

  for (const token of tokens) {
    const { 0: word, groups } = token;

    const newlineExpression = Boolean(groups['newline']);
    const whitespaceExpression = Boolean(groups['whitespace']);

    const wordWidth = [...word].reduce((width, character) => {
      return width + characterToWidth.get(character);
    }, 0);

    const wordOverflows = currentLineWidth + wordWidth >= containerWidth;

    let newLine: number;
    let newLineWidth: number;
    let newLineText: string;

    if (newlineExpression) {
      lines = lines.concat(currentLineText + word);

      newLine = currentLine + 1;
      newLineWidth = 0;
      newLineText = '';
    } else if (whitespaceExpression) {
      if (wordOverflows) {
        lines = lines.concat(currentLineText);

        newLine = currentLine + 1;
        newLineWidth = 0;
        newLineText = word;
      } else {
        newLine = currentLine;
        newLineWidth = currentLineWidth + wordWidth;
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
        newLineWidth = currentLineWidth + wordWidth;
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

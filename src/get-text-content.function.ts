import ContainerStyle from './container-style.interface';
import getCharacterWidths from './get-character-widths.function';
import getNormalizedPageHeight from './get-normalized-page-height.function';
import { tokenExpression } from './glyphs.const';

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
  let currentTextContent = '';

  for (const token of tokens) {
    const { 0: word, groups } = token;

    const newlineExpression = Boolean(groups['newline']);
    const whitespaceExpression = Boolean(groups['whitespace']);
    const optional = newlineExpression || whitespaceExpression;

    const wordWidth = [...word].reduce((width, character) => {
      return width + characterToWidth.get(character);
    }, 0);

    const newLineWidth = currentLineWidth + wordWidth;

    const wordOverflows = newLineWidth >= containerWidth;

    if (newlineExpression) {
      currentLine++;
      currentLineWidth = 0;
    } else if (wordOverflows) {
      currentLine++;

      /*
       * We must add the token to the text if it is contentful.
       * This, of course, assumes 'wordWidth' is less than the container width... we will need to work with 'break-word' and 'hyphens'
       */
      currentLineWidth = optional ? 0 : wordWidth;
    } else {
      currentLineWidth = newLineWidth;
    }

    if (currentLine === numLines) {
      yield currentTextContent;

      currentLine = 0;
      currentTextContent = optional ? '' : word;
    } else {
      currentTextContent += word;
    }
  }

  yield currentTextContent;
}

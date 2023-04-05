import getCharacterWidths from './get-character-widths.function';
import getNormalizedPageHeight from './get-normalized-page-height.function';
import { newline, tokenExpression, whitespace } from './glyphs.const';

interface ContainerStyle {
  /** In pixels. */
  width: number;
  /** In pixels. */
  height: number;
  computedFontSize: string;
  computedFontFamily: string;
  /** In pixels. */
  lineHeight: number;
  padding: {
    /** In pixels. */
    top: number;
    /** In pixels. */
    right: number;
    /** In pixels. */
    bottom: number;
    /** In pixels. */
    left: number;
  };
  margin: {
    /** In pixels. */
    top: number;
    /** In pixels. */
    right: number;
    /** In pixels. */
    bottom: number;
    /** In pixels. */
    left: number;
  };
}

export default function* getTextContent(
  {
    width,
    height,
    computedFontFamily,
    computedFontSize,
    lineHeight,
    padding,
    margin,
  }: ContainerStyle,
  textContent: string
): Generator<string> {
  const containerWidth =
    width - padding.left - padding.right - margin.left - margin.right;

  const pageHeight = getNormalizedPageHeight(
    height,
    lineHeight,
    padding,
    margin
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

  for (const [token] of tokens) {
    const newLine = token === newline;
    // Whitespace is optional if this is the end of the line.
    const optional = newLine || token === whitespace;

    const wordWidth = [...token].reduce((width, character) => {
      return width + characterToWidth.get(character);
    }, 0);

    const newLineWidth = currentLineWidth + wordWidth;

    const wordOverflows = newLineWidth >= containerWidth;

    if (newLine) {
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
      currentTextContent = optional ? '' : token;
    } else {
      currentTextContent += token;
    }
  }

  yield currentTextContent;
}

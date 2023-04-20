import Big from 'big.js';

import ContainerStyle from '../../container-style.interface';
import { DefaultLinkBreakParser } from '../default-line-break/default-line-break.parser';
import getNormalizedPageHeight from './get-normalized-page-height.function';
import getWordWidth from './get-word-width.function';

export default class ParserBuilder {
  static fromContainerStyle({
    width,
    height,
    computedFontFamily,
    computedFontSize,
    lineHeight,
    padding,
    margin,
    border,
    textIndent = '',
  }: ContainerStyle): DefaultLinkBreakParser {
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

    const calculateWordWidth = getWordWidth(
      computedFontSize,
      computedFontFamily
    );

    const textIndentWidth = calculateWordWidth(textIndent);

    const parser = new DefaultLinkBreakParser({
      textIndent: {
        text: textIndent,
        width: Big(textIndentWidth),
      },
      pageLines: numLines,
      pageWidth: containerWidth,
    });

    parser.setCalculateWordWidth(calculateWordWidth);

    return parser;
  }
}

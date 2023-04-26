import ContainerStyle from '../../container-style.interface';
import { DefaultLinkBreakParser } from '../default-line-break/default-line-break.parser';
import getNormalizedPageHeight from './get-normalized-page-height.function';
import Processor from '../../processors/models/processor.interface';
import WordWidthCalculator from '../../word-width.calculator';

export default class ParserBuilder {
  private parser: DefaultLinkBreakParser | undefined;

  private calculator: WordWidthCalculator | undefined;

  fromContainerStyle({
    width,
    height,
    computedFontFamily,
    computedFontSize,
    lineHeight,
    padding,
    margin,
    border,
  }: ContainerStyle): ParserBuilder {
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

    const calculator = (this.calculator = new WordWidthCalculator(
      computedFontSize,
      computedFontFamily
    ));

    const parser = (this.parser = new DefaultLinkBreakParser({
      pageLines: numLines,
      pageWidth: containerWidth,
    }));

    parser.setCalculator(calculator);

    return this;
  }

  processors(processors: Array<Processor>): ParserBuilder {
    processors.forEach((processor) =>
      processor.configure?.({
        calculator: this.calculator,
      })
    );

    this.parser.setProcessors(processors);

    return this;
  }

  build(): DefaultLinkBreakParser {
    return this.parser;
  }
}

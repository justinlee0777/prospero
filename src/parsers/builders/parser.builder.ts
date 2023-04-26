import ContainerStyle from '../../container-style.interface';
import getNormalizedPageHeight from './get-normalized-page-height.function';
import Processor from '../../processors/models/processor.interface';
import WordWidthCalculator from '../../word-width.calculator';
import Parser from '../models/parser.interface';
import ParserFactory from '../parser.factory';
import Optional from '../../utils/optional.type';

const fromContainerStyle = 'fromContainerStyle';

export default class ParserBuilder {
  static entrypoints = [fromContainerStyle];

  private parser: Parser | undefined;

  private calculator: WordWidthCalculator | undefined;

  /**
   * Use ContainerStyle to initialize much of what you need for a parser.
   */
  [fromContainerStyle]({
    width,
    height,
    computedFontFamily,
    computedFontSize,
    lineHeight,
    padding = { top: 0, right: 0, bottom: 0, left: 0 },
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    border = { top: 0, right: 0, bottom: 0, left: 0 },
  }: Optional<ContainerStyle, 'padding' | 'margin' | 'border'>): ParserBuilder {
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

    const parser = (this.parser = ParserFactory.create({
      pageLines: numLines,
      pageWidth: containerWidth,
    }));

    parser.setCalculator(calculator);

    return this;
  }

  /**
   * Set processors on the building parser.
   */
  processors(processors: Array<Processor>): ParserBuilder {
    if (!this.parser) {
      throw new Error(this.writeErrorMessage());
    }

    processors.forEach((processor) =>
      processor.configure?.({
        calculator: this.calculator,
      })
    );

    this.parser.setProcessors(processors);

    return this;
  }

  /**
   * Get the built parser.
   * @throws if there is no internal parser yet.
   */
  build(): Parser {
    if (!this.parser) {
      throw new Error(this.writeErrorMessage());
    }

    return this.parser;
  }

  private writeErrorMessage(): string {
    return `The parser has not been built yet. Please start from entrypoints: ${ParserBuilder.entrypoints.join(
      ','
    )}.`;
  }
}

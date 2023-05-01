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

  private containerStyle: ContainerStyle;

  private processors: Array<Processor> = [];

  private fontLocation: string;

  /**
   * Use ContainerStyle to initialize much of what you need for a parser.
   */
  [fromContainerStyle](
    containerStyle: Optional<ContainerStyle, 'padding' | 'margin' | 'border'>
  ): ParserBuilder {
    this.containerStyle = {
      ...containerStyle,
      padding: containerStyle.padding ?? {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      margin: containerStyle.margin ?? { top: 0, right: 0, bottom: 0, left: 0 },
      border: containerStyle.border ?? { top: 0, right: 0, bottom: 0, left: 0 },
    };

    return this;
  }

  /**
   * Set processors on the building parser.
   */
  setProcessors(processors: Array<Processor>): ParserBuilder {
    this.processors = processors;

    return this;
  }

  setFontLocation(url: string): ParserBuilder {
    this.fontLocation = url;

    return this;
  }

  /**
   * Get the built parser.
   * @throws if there is no internal parser yet.
   */
  build(): Parser {
    const {
      width,
      height,
      computedFontFamily,
      computedFontSize,
      lineHeight,
      padding,
      margin,
      border,
    } = this.containerStyle;

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

    const calculator = new WordWidthCalculator(
      computedFontSize,
      computedFontFamily,
      this.fontLocation
    );

    const parser = ParserFactory.create({
      pageLines: numLines,
      pageWidth: containerWidth,
    });

    parser.setCalculator(calculator);

    const { processors } = this;

    processors.forEach((processor) =>
      processor.configure?.({
        calculator,
      })
    );

    parser.setProcessors(processors);

    return parser;
  }
}

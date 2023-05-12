import ContainerStyle from '../../container-style.interface';
import Processor from '../../processors/models/processor.interface';
import Optional from '../../utils/optional.type';
import toPixelUnits from '../../utils/to-pixel-units.function';
import WordWidthCalculator from '../../word-width.calculator';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import Parser from '../models/parser.interface';
import ParserFactory from '../parser.factory';

const fromContainerStyle = 'fromContainerStyle';

export default class ParserBuilder {
  static entrypoints = [fromContainerStyle];

  private ParserConstructor: (config: CreateTextParserConfig) => Parser =
    ParserFactory.create;

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

  forHTML(): ParserBuilder {
    this.ParserConstructor = ParserFactory.createForHTML;

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

    const containerHeight =
      height -
      padding.top -
      padding.bottom -
      margin.top -
      margin.bottom -
      border.top -
      border.bottom;

    const calculator = new WordWidthCalculator(
      computedFontSize,
      computedFontFamily,
      lineHeight,
      this.fontLocation
    );

    const parser = this.ParserConstructor({
      fontSize: toPixelUnits(computedFontSize),
      pageHeight: containerHeight,
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

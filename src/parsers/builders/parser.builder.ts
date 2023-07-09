import PageStyles from '../../models/page-styles.interface';
import Transformer from '../../transformers/models/transformer.interface';
import Constructor from '../../utils/constructor.type';
import Optional from '../../utils/optional.type';
import toPixelUnits from '../../utils/to-pixel-units.function';
import IWordWidthCalculator from '../../word-width-calculator.interface';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import Parser from '../models/parser.interface';
import IParserFactory from '../parser-factory.interface';
import IParserBuilder from './parser.builder.interface';

export default function ParserBuilder(
  WordWidthCalculator: {
    new (
      computedFontSize: string,
      computedFontFamily: string,
      lineHeight: number,
      fontLocation?: string
    ): IWordWidthCalculator;
  },
  ParserFactory: IParserFactory
): Constructor<IParserBuilder, []> {
  return class ParserBuilder {
    private ParserConstructor: (config: CreateTextParserConfig) => Parser =
      ParserFactory.create;

    private containerStyle: PageStyles;

    private transformers: Array<Transformer> = [];

    private fontLocation: string;

    /**
     * Use ContainerStyle to initialize much of what you need for a parser.
     */
    fromPageStyles(
      containerStyle: Optional<PageStyles, 'padding' | 'margin' | 'border'>
    ): ParserBuilder {
      this.containerStyle = {
        ...containerStyle,
        padding: containerStyle.padding ?? {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        margin: containerStyle.margin ?? {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        border: containerStyle.border ?? {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      };

      return this;
    }

    /**
     * Set processors on the building parser.
     */
    setProcessors(transformers: Array<Transformer>): ParserBuilder {
      this.transformers = transformers;

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

      parser.setProcessors(this.transformers);

      return parser;
    }
  };
}

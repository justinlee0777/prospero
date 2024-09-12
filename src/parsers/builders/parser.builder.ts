import { PageStyles } from "../../models";
import FontLocations from "../../models/font-locations.interface";
import HTMLTransformerOptions from "../../transformers/html/html-transformer-options.interface";
import Optional from "../../utils/optional.type";
import toPixelUnits from "../../utils/to-pixel-units.function";
import DefaultLineBreakParser from "../default-line-break/default-line-break.parser";
import CreateTextParserConfig from "../models/create-text-parser-config.interface";
import Parser from "../models/parser.interface";
import Transformer from '../../transformers/models/transformer.interface';

export default class ParserBuilder {
    private ParserConstructor: (config: CreateTextParserConfig) => Parser = (config) => new DefaultLineBreakParser(config);

    private containerStyle: PageStyles;

    private transformers: Array<Transformer> = [];

    private fontLocation: FontLocations;

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
    setTransformers(transformers: Array<Transformer>): ParserBuilder {
      this.transformers = transformers;

      return this;
    }

    setFontLocation(urlOrLocations: FontLocations): ParserBuilder {
      this.fontLocation = urlOrLocations;

      return this;
    }

    forHTML(options?: HTMLTransformerOptions): ParserBuilder {
      throw new Error('forHTML not implemented')
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


      const parser = this.ParserConstructor({
        fontSize: toPixelUnits(computedFontSize),
        pageHeight: containerHeight,
        pageWidth: containerWidth,
        pageStyles: this.containerStyle,
      });

      parser.setTransformers(this.transformers);

      return parser;
    }
  };
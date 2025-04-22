import { PagesConfig, PageStyles } from '../../models';
import FontLocations from '../../models/font-locations.interface';
import Transformer from '../../transformers/models/transformer.interface';
import Optional from '../../utils/optional.type';
import toPixelUnits from '../../utils/to-pixel-units.function';
import registerFont from '../../web/utils/register-font.function';
import HTMLParser from '../html/html.parser';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import Parser from '../models/parser.interface';

export default class ParserBuilder {
  private ParserConstructor: (config: CreateTextParserConfig) => Parser = (
    config
  ) => new HTMLParser(config);

  private containerStyle: PageStyles | undefined;

  private transformers: Array<Transformer> = [];

  private fontLocation: FontLocations | undefined;

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

  /**
   * Get the built parser.
   * @throws if there is no internal parser yet.
   */
  async build(
    config: Pick<PagesConfig, 'sectionBreak' | 'footnotes'> = {}
  ): Promise<Parser> {
    if (!this.containerStyle) {
      throw new Error("'fromPageStyles' has not been invoked.");
    }

    const {
      width,
      height,
      computedFontFamily,
      computedFontSize,
      padding,
      margin,
      border,
    } = this.containerStyle;

    const containerWidth =
      width -
      (padding?.left ?? 0) -
      (padding?.right ?? 0) -
      (margin?.left ?? 0) -
      (margin?.right ?? 0) -
      (border?.left ?? 0) -
      (border?.right ?? 0);

    const containerHeight =
      height -
      (padding?.top ?? 0) -
      (padding?.bottom ?? 0) -
      (margin?.top ?? 0) -
      (margin?.bottom ?? 0) -
      (border?.top ?? 0) -
      (border?.bottom ?? 0);

    if (this.fontLocation) {
      await registerFont(computedFontFamily, this.fontLocation);
    }

    const parser = this.ParserConstructor({
      fontSize: toPixelUnits(computedFontSize),
      pageHeight: containerHeight,
      pageWidth: containerWidth,
      pageStyles: this.containerStyle,
      ...config,
    });

    parser.setTransformers(this.transformers);

    return parser;
  }
}

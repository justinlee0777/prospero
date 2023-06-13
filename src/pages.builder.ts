import ContainerStyle from './container-style.interface';
import Pages from './pages';
import Transformer from './transformers/models/transformer.interface';

const setFontMethod = 'setFont';
const setLineHeightMethod = 'setLineHeight';
const setTextMethod = 'setText';
const addSizeMethod = 'addSize';

interface PagesBuilderOptions {
  /** Build the pages interpreting the text content as HTML. */
  html?: boolean;
}

/**
 * Build one or more pages. Useful for generating pages across different viewports for responsive design.
 */
export default class PagesBuilder {
  private static requiredMethods = [
    setFontMethod,
    setLineHeightMethod,
    setTextMethod,
    addSizeMethod,
  ];

  private font: Pick<ContainerStyle, 'computedFontSize' | 'computedFontFamily'>;
  private fontLocation: string;

  private lineHeight: number;

  private box: Pick<ContainerStyle, 'margin' | 'padding' | 'border'> = {
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    border: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };

  private text: string;

  private transformers: Array<Transformer> = [];

  private sizes: Array<Pick<ContainerStyle, 'width' | 'height'>> = [];

  [setFontMethod](
    computedFontSize: string,
    computedFontFamily: string,
    fontLocation?: string
  ): PagesBuilder {
    this.font = {
      computedFontSize,
      computedFontFamily,
    };
    this.fontLocation = fontLocation;

    return this;
  }

  [setLineHeightMethod](lineHeight: number): PagesBuilder {
    this.lineHeight = lineHeight;

    return this;
  }

  setMargin(margin: ContainerStyle['margin']): PagesBuilder {
    this.box.margin = margin;

    return this;
  }

  setPadding(padding: ContainerStyle['padding']): PagesBuilder {
    this.box.padding = padding;

    return this;
  }

  setBorder(border: ContainerStyle['border']): PagesBuilder {
    this.box.border = border;

    return this;
  }

  [setTextMethod](text: string): PagesBuilder {
    this.text = text;

    return this;
  }

  setTransformers(transformers: Array<Transformer>): PagesBuilder {
    this.transformers = transformers;

    return this;
  }

  [addSizeMethod](width: number, height: number): PagesBuilder {
    this.sizes.push({
      width,
      height,
    });

    return this;
  }

  /**
   * @returns sorted by width ascending.
   * @throws if 'setFont', 'setLineHeight', 'setText', 'addSize' have not been called at least once.
   */
  build({ html }: PagesBuilderOptions = {}): Array<Pages> {
    if (!this.validate()) {
      throw new Error(
        `The builder requires additional information. Ensure you have called ${PagesBuilder.requiredMethods
          .map((method) => `'${method}'`)
          .join(', ')} before building.`
      );
    }

    return this.sizes.map((size) => {
      return new Pages(
        {
          ...size,
          lineHeight: this.lineHeight,
          ...this.font,
          ...this.box,
        },
        this.text,
        this.transformers,
        { fontLocation: this.fontLocation, html }
      );
    });
  }

  private validate(): boolean {
    return Boolean(
      this.font &&
        this.lineHeight > 0 &&
        this.text?.length > 0 &&
        this.sizes.length > 0
    );
  }
}

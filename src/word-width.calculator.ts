import CalculateWordWidth from './parsers/builders/calculate-word-width.interface';
import { FontStyles } from './parsers/html/font-styles.interface';
import Constructor from './utils/constructor.type';
import toPixelUnits from './utils/to-pixel-units.function';
import IWordWidthCalculator from './word-width-calculator.interface';

export default function WordWidthCalculator(
  registerFont: (fontFamily: string, fontLocation?: string) => void,
  createCanvas: () => HTMLCanvasElement
): Constructor<IWordWidthCalculator, [string, string, number, string?]> {
  /**
   * Calculates a word's pixel width using the <canvas> element.
   */
  return class WordWidthCalculator {
    private context: CanvasRenderingContext2D;

    private defaultFont: string;
    private defaultLineHeight: number;

    /** Is in the format of multiplier of font size. */
    private lineHeight: number;

    /** In pixels. */
    private calculatedLineHeight: number;

    constructor(
      private fontSize: string,
      private fontFamily: string,
      lineHeightInPixels: number,
      fontLocation?: string
    ) {
      registerFont(fontFamily, fontLocation);

      this.defaultLineHeight = this.calculatedLineHeight = lineHeightInPixels;
      this.lineHeight = lineHeightInPixels / toPixelUnits(fontSize);

      const canvas = createCanvas();
      const ctx = (this.context = canvas.getContext('2d'));
      this.defaultFont = ctx.font = `${fontSize} ${fontFamily}`;
    }

    calculate: CalculateWordWidth = (word) =>
      this.context.measureText(word).width;

    /**
     * @returns the line height. The calculation is (originalLineHeight / originalFontSize) * newFontSize;
     * so using the original line height multiplier to calculate.
     */
    getCalculatedLineHeight(): number {
      return this.calculatedLineHeight;
    }

    /**
     * Apply a temporary change in font ex. for a header.
     */
    apply(styles: FontStyles): void {
      const size = styles['font-size'] ?? this.fontSize;
      const weight = styles['font-weight'];
      const family = styles['font-family'] ?? this.fontFamily;

      let font = `${size ?? this.fontSize} ${family}`;

      if (weight) {
        font = `${weight} ${font}`;
      }

      this.context.font = font;

      if (size) {
        this.calculatedLineHeight = this.lineHeight * toPixelUnits(size);
      }
    }

    /**
     * Reset to the original font after a temporary change.
     */
    reset(): void {
      this.context.font = this.defaultFont;
      this.calculatedLineHeight = this.defaultLineHeight;
    }
  };
}

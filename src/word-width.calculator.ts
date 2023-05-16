import { CanvasRenderingContext2D, createCanvas, registerFont } from 'canvas';

import CalculateWordWidth from './parsers/builders/calculate-word-width.interface';
import toPixelUnits from './utils/to-pixel-units.function';

/**
 * Calculates a word's pixel width using the <canvas> element.
 */
export default class WordWidthCalculator {
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
    fontLocation && registerFont(fontLocation, { family: fontFamily });

    this.defaultLineHeight = this.calculatedLineHeight = lineHeightInPixels;
    this.lineHeight = lineHeightInPixels / toPixelUnits(fontSize);

    const canvas = createCanvas(0, 0);
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
  apply({ size, weight }: { size?: string; weight?: string }): void {
    let font = `${size ?? this.fontSize} ${this.fontFamily}`;

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
}

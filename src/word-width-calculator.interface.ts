import CalculateWordWidth from './parsers/builders/calculate-word-width.interface';

export default interface IWordWidthCalculator {
  calculate: CalculateWordWidth;

  /**
   * @returns the line height. The calculation is (originalLineHeight / originalFontSize) * newFontSize;
   * so using the original line height multiplier to calculate.
   */
  getCalculatedLineHeight(): number;

  /**
   * Apply a temporary change in font ex. for a header.
   */
  apply({ size, weight }: { size?: string; weight?: string }): void;

  /**
   * Reset to the original font after a temporary change.
   */
  reset(): void;
}

import { CanvasRenderingContext2D, createCanvas } from 'canvas';
import CalculateWordWidth from './parsers/builders/calculate-word-width.interface';

/**
 * Calculates a word's pixel width using the <canvas> element.
 */
export default class WordWidthCalculator {
  private context: CanvasRenderingContext2D;

  constructor(fontSize: string, fontFamily: string) {
    const canvas = createCanvas(0, 0);
    const ctx = (this.context = canvas.getContext('2d'));
    ctx.font = `${fontSize} ${fontFamily}`;
  }

  calculate: CalculateWordWidth = (word) =>
    this.context.measureText(word).width;
}

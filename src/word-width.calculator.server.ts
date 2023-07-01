import { createCanvas, registerFont } from 'canvas';

import WordWidthCalculator from './word-width.calculator';

export default WordWidthCalculator(
  (fontFamily, fontLocation) =>
    fontLocation && registerFont(fontLocation, { family: fontFamily }),
  () => createCanvas(0, 0) as unknown as HTMLCanvasElement
);

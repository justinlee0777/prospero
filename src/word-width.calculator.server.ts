import { createCanvas, registerFont } from 'canvas';

import WordWidthCalculator from './word-width.calculator';

export default WordWidthCalculator(
  (fontFamily, fontLocation) => {
    if (typeof fontLocation === 'undefined') {
      fontLocation = [];
    } else if (typeof fontLocation === 'string') {
      fontLocation = [
        {
          url: fontLocation,
        },
      ];
    }

    fontLocation.forEach(({ url, style, weight }) => {
      registerFont(url, { family: fontFamily, style, weight });
    });
  },
  () => createCanvas(0, 0) as unknown as HTMLCanvasElement
);

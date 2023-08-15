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
      const fontFace = new FontFace(fontFamily, `url(${url})`, {
        style,
        weight,
      });

      document.fonts.add(fontFace);

      fontFace.load();
    });
  },
  () => document.createElement('canvas')
);

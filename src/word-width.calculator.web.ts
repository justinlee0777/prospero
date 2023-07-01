import WordWidthCalculator from './word-width.calculator';

export default WordWidthCalculator(
  (fontFamily, fontLocation) => {
    if (fontLocation) {
      const fontFace = new FontFace(fontFamily, `url(${fontLocation})`);

      document.fonts.add(fontFace);

      fontFace.load();
    }
  },
  () => document.createElement('canvas')
);

import { glyphs, newline } from './glyphs.const';

export default function getCharacterWidths(
  fontSizeInPixels: string,
  fontFamily: string
): Map<string, number> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSizeInPixels} ${fontFamily}`;

  // Initialize for meta characters.
  const characterToPixels = new Map<string, number>([[newline, 0]]);

  for (const glyph of glyphs) {
    characterToPixels.set(glyph, ctx.measureText(glyph).width);
  }

  return characterToPixels;
}

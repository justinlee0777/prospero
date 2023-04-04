export default function getCharacterWidths(
  fontSizeInPixels: string,
  fontFamily: string
): Map<string, number> {
  const allCapsAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const alphabet = allCapsAlphabet + allCapsAlphabet.toLowerCase();
  const glyphs = alphabet + `!?,.:;"'- `;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSizeInPixels} ${fontFamily}`;

  const characterToPixels = new Map<string, number>();

  for (const glyph of glyphs) {
    characterToPixels.set(glyph, ctx.measureText(glyph).width);
  }

  return characterToPixels;
}

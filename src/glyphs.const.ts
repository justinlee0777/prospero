export const allCapsAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const lowCapsAlphabet = allCapsAlphabet.toLowerCase();
export const numbers = '1234567890';
export const accented = 'é';
export const punctuation = `!?,.:;"'’-—“”…`;
export const whitespace = ' ';

export const nonWhitespaceGlyphs =
  allCapsAlphabet + lowCapsAlphabet + numbers + accented + punctuation;

export const glyphs = nonWhitespaceGlyphs + whitespace;

export const newline = '\n';

export const allCapsAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const lowCapsAlphabet = allCapsAlphabet.toLowerCase();
export const punctuation = `!?,.:;"'-—“`;
export const whitespace = ' ';

export const nonWhitespaceGlyphs =
  allCapsAlphabet + lowCapsAlphabet + punctuation;

export const glyphs = nonWhitespaceGlyphs + whitespace;

export const newline = '\n';

const escapedPunctuation = [...punctuation]
  .map((glyph) => `\\${glyph}`)
  .join('');

/**
 * <token> = <punctuatedWord> | <whitespace> | <newline>
 * <punctuatedWord> = <punctuation> <word> <punctuation>
 * <punctuation> = "!" | "?" ... | ""
 * <word> = alphabetic sequence with at least one character
 * <whitespace> = " "
 * <newline> = "\n"
 */
const characterExpression = `[A-Za-z${escapedPunctuation}]+`;
const whitespaceExpression = '\\s';
const newlineExpression = newline;
const expressions = [
  characterExpression,
  whitespaceExpression,
  newlineExpression,
];

export const tokenExpression = new RegExp(expressions.join('|'), 'g');

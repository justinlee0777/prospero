export default function getWordWidth(
  computedFontSize: string,
  computedFontFamily: string
): (text: string) => number {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${computedFontSize} ${computedFontFamily}`;

  return (word) => ctx.measureText(word).width;
}

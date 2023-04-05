/**
 * @param containerHeight after padding, margin, border
 */
export default function getNormalizedPageHeight(
  containerHeight: number,
  lineHeightInPixels: number
): number {
  const difference = containerHeight % lineHeightInPixels;

  return containerHeight - difference;
}

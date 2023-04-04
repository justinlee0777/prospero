export default function getNormalizedPageHeight(
  containerHeight: number,
  lineHeightInPixels: number,
  paddingInPixels: { top: number; bottom: number },
  marginInPixels: { top: number; bottom: number }
): number {
  const calculatedContainerHeight =
    containerHeight -
    paddingInPixels.top -
    paddingInPixels.bottom -
    marginInPixels.top -
    marginInPixels.bottom;

  const difference = calculatedContainerHeight % lineHeightInPixels;

  return calculatedContainerHeight - difference;
}

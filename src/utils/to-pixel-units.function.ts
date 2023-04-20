/**
 * Convert string styles like font-size, line-height, etc into their pixel units
 * @param value ex. "12px", "24px"
 * @returns the numerical part of the value ex. 12, 24
 * @throws an error if the value is not denoted in pixels.
 */
export default function toPixelUnits(value: string): number {
  let replaced = false;

  const replacedString = value.replace(/(\d+)px/, (_, units) => {
    replaced = true;
    return units;
  });

  if (!replaced) {
    throw new Error(
      `"${value}" is not denoted in pixels and therefore not valid for converting into pixels.`
    );
  }

  return Number(replacedString);
}

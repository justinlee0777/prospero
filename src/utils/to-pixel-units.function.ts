/**
 * Convert string styles like font-size, line-height, etc into their pixel units
 * @returns the
 */
export default function toPixelUnits(value: string): number {
  return Number(value.replace(/[A-Z]/gi, ''));
}

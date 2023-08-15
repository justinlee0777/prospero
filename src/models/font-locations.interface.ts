export interface FontLocation {
  url: string;
  /** Whether the loaded font should be mapped to a specific font weight. */
  weight?: string;
  /** Whether the loaded font should be maped to a specific style ex. italics. */
  style?: string;
}

/**
 * If string: a font is uploaded without style or weight.
 */
type FontLocations = string | Array<FontLocation>;

export default FontLocations;

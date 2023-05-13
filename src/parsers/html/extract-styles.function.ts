import StyleValueRegex from '../../regexp/style-value.regexp';
import StyleRegex from '../../regexp/style.regexp';
import { FontStyles, ValidFontStyles } from './font-styles.interface';

/**
 * Extract style values from the 'style' attribute on an HTML element.
 * @param htmlString ex. <span style="font-weight: bold"></span>
 * @returns only the font styles allowed by the HTMLParser. @see ./font-styles.interface.ts
 */
export default function extractStyles(htmlString: string): FontStyles | null {
  const [styleString] = htmlString.match(StyleRegex) ?? [];

  if (!styleString) {
    return null; // If there is no 'style' attribute, terminate
  }

  const styles = [...(styleString.matchAll(StyleValueRegex) ?? [])];

  const fontStyles: FontStyles = {};

  for (const [, property, value] of styles) {
    if (ValidFontStyles.includes(property)) {
      // Only permit allowed font styles.
      fontStyles[property] = value;
    }
  }

  return Object.keys(fontStyles).length > 0 ? fontStyles : null; // If there are no font styles, terminate with a negative.
}

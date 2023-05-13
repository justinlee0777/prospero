import StyleValueRegex from '../../regexp/style-value.regexp';
import StyleRegex from '../../regexp/style.regexp';
import { FontStyles, ValidFontStyles } from './font-styles.interface';

export default function extractStyles(htmlString: string): FontStyles | null {
  const [styleString] = htmlString.match(StyleRegex) ?? [];

  if (!styleString) {
    return null;
  }

  const styles = [...(styleString.matchAll(StyleValueRegex) ?? [])];

  const fontStyles: FontStyles = {};

  for (const [, property, value] of styles) {
    if (ValidFontStyles.includes(property)) {
      fontStyles[property] = value;
    }
  }

  return Object.keys(fontStyles).length > 0 ? fontStyles : null;
}

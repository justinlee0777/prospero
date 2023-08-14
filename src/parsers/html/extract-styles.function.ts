import StyleValueRegex from '../../regexp/style-value.regexp';
import StyleRegex from '../../regexp/style.regexp';
import { BlockStyles, ValidBlockStyles } from './block-styles.interface';
import {
  FontStyle,
  FontStyles,
  ValidFontStyles,
} from './font-styles.interface';
import Styles from './styles.interface';

/**
 * Extract style values from the 'style' attribute on an HTML element.
 * @param htmlString ex. <span style="font-weight: bold"> (opening only)
 * @returns only the styles allowed by the HTMLParser. @see ./font-styles.interface.ts @see ./block-styles.interface.ts
 */
export default function extractStyles(htmlString: string): Styles {
  const [styleString = ''] = htmlString.match(StyleRegex) ?? [];

  const styles = [...(styleString.matchAll(StyleValueRegex) ?? [])];

  const fontStyles: FontStyles = {};
  const blockStyles: BlockStyles = {};

  // Handle a specific use case for <code> tags, which have 'font-family: monospace'.
  const codeRegex = /\<code.*\>/;

  if (codeRegex.test(htmlString)) {
    // Should be overridden by a more specific style.
    fontStyles[FontStyle['font-family']] = 'monospace';
  }

  // Handle a specific use case for <em> tags, which have 'font-style: italic'
  const emRegex = /\<em.*\>/;

  if (emRegex.test(htmlString)) {
    fontStyles[FontStyle['font-style']] = 'italic';
  }

  const strongRegex = /\<strong.*\>/;

  if (strongRegex.test(htmlString)) {
    fontStyles[FontStyle['font-weight']] = 'bold';
  }

  for (const [, property, value] of styles) {
    if (ValidFontStyles.includes(property)) {
      // Only permit allowed font styles.
      fontStyles[property] = value;
    }
    if (ValidBlockStyles.includes(property)) {
      blockStyles[property] = value;
    }
  }

  return [
    ['font', fontStyles],
    ['block', blockStyles],
  ].reduce((acc, [key, styles]: [string, Object]) => {
    return {
      ...acc,
      [key]: Object.keys(styles).length > 0 ? styles : null,
    };
  }, {}) as Styles;
}

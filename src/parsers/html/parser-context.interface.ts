import { BlockStyles } from './block-styles.interface';
import { FontStyles } from './font-styles.interface';

/**
 * The context of the parser.
 * Contains information on the styles in the parser's allowlist, used for parsing.
 */
export default interface ParserContext {
  pageWidth: number;

  blockStyles?: BlockStyles;
  fontStyles?: FontStyles;
  /**
   * Describes an HTML tag found in the text.
   */
  tag?: {
    opening: string;
    name: string;
  };
}

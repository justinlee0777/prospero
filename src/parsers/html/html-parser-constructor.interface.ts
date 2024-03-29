import Big from 'big.js';

import HTMLTransformerOptions from '../../transformers/html/html-transformer-options.interface';
import Constructor from '../../utils/constructor.type';
import CreateLineBreakParserConfig from '../default-line-break/create-line-break-parser-config.interface';
import Parser from '../models/parser.interface';
import { BlockStyles } from './block-styles.interface';
import { FontStyles } from './font-styles.interface';

/**
 * The context of the parser.
 * Contains information on the styles in the parser's allowlist, used for parsing.
 */
export interface ParserContext {
  pageWidth: number;
  lineHeight: Big;

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

type HTMLParserConstructor = Constructor<
  Parser,
  [CreateLineBreakParserConfig, HTMLTransformerOptions?, ParserContext?]
>;

export default HTMLParserConstructor;

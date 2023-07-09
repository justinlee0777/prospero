import CreateElementConfig from '../../elements/create-element.config';
import HTMLTransformerOptions from '../../transformers/html/html-transformer-options.interface';
import Transformer from '../../transformers/models/transformer.interface';
import BookConfig from '../book/book-config.interface';
import FlexibleBookPageStyles from './flexible-book-container-style.interface';
import FlexibleBookElement from './flexible-book-element.interface';
import FlexibleBookMediaQuery from './flexible-book-media-query.interface';

interface BaseRequiredArgs {
  pageStyles: FlexibleBookPageStyles;
  text: string;
}

interface RequiredArgsWithSingleConfig extends BaseRequiredArgs {
  /** Book configuration for the child Book. */
  config: BookConfig;
}

interface RequiredArgsWithMediaQueryConfigs extends BaseRequiredArgs {
  /**
   * Book configurations for various screen widths.
   * The first config is the fallback and the rest follow media query patterns.
   */
  mediaQueryList: [BookConfig, ...Array<FlexibleBookMediaQuery>];
}

type RequiredArgs =
  | RequiredArgsWithSingleConfig
  | RequiredArgsWithMediaQueryConfigs;

interface OptionalArgs {
  fontLocation?: string;

  transformers?: Array<Transformer>;

  bookClassNames?: Array<string>;

  /**
   * Indicates the book is meant to parse HTML.
   */
  forHTML?: boolean | HTMLTransformerOptions;
}

export default interface CreateFlexibleBookElement {
  (
    args: RequiredArgs,
    options?: OptionalArgs,
    element?: CreateElementConfig
  ): FlexibleBookElement;
}

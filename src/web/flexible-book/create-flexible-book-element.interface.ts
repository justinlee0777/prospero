import CreateElementConfig from '../../elements/create-element.config';
import { PagesConfig } from '../../models';
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

interface OptionalArgs extends PagesConfig {
  transformers?: Array<Transformer>;

  bookClassNames?: Array<string>;
}

export default interface CreateFlexibleBookElement {
  (
    args: RequiredArgs,
    options?: OptionalArgs,
    element?: CreateElementConfig
  ): FlexibleBookElement;
}

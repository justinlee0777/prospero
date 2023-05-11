import CreateElementConfig from '../../elements/create-element.config';
import Processor from '../../processors/models/processor.interface';
import BookConfig from '../book/book-config.interface';
import FlexibleBookContainerStyle from './flexible-book-container-style.interface';
import FlexibleBookElement from './flexible-book-element.interface';
import FlexibleBookMediaQuery from './flexible-book-media-query.interface';

interface BaseRequiredArgs {
  containerStyle: FlexibleBookContainerStyle;
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
  /**
   * A function to initialize processors for each screen width.
   * This is needed as processors are stateful.
   */
  createProcessors?: () => Array<Processor>;

  bookClassNames?: Array<string>;

  forHTML?: boolean;
}

export default interface CreateFlexibleBookElement {
  (
    args: RequiredArgs,
    options?: OptionalArgs,
    element?: CreateElementConfig
  ): FlexibleBookElement;
}

import CreateElementConfig from '../../elements/create-element.config';
import Processor from '../../processors/models/processor.interface';
import BookConfig from '../book/book-config.interface';
import FlexibleBookContainerStyle from './flexible-book-container-style.interface';
import FlexibleBookElement from './flexible-book-element.interface';
import FlexibleBookMediaQuery from './flexible-book-media-query.interface';

interface RequiredArgs {
  containerStyle: FlexibleBookContainerStyle;
  text: string;
  config: BookConfig | [BookConfig, ...Array<FlexibleBookMediaQuery>];
}

interface OptionalArgs {
  fontLocation?: string;
  createProcessors?: () => Array<Processor>;
}

export default interface CreateFlexibleBookElement {
  (
    args: RequiredArgs,
    options?: OptionalArgs,
    element?: CreateElementConfig
  ): FlexibleBookElement;
}

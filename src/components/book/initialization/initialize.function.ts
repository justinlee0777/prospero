import CreateElementConfig from '../../../elements/create-element.config';
import div from '../../../elements/div.function';
import BookElement from '../book-element.interface';

export default function initialize(
  { media, prospero }: Omit<BookElement, keyof HTMLElement>,
  config: CreateElementConfig = {}
): BookElement {
  const attributes = {
    ...(config.attributes ?? {}),
    tabindex: 0,
  };

  const book = div({
    ...config,
    attributes,
  }) as unknown as BookElement;

  book.prospero = prospero;
  book.media = media;

  return book;
}

import styles from '../book.module.css';

import CreateElementConfig from '../../../elements/create-element.config';
import div from '../../../elements/div.function';
import BookElement from '../book-element.interface';

export default function initialize(
  {
    media,
    elementTagIdentifier,
    destroy,
  }: Omit<BookElement, keyof HTMLElement>,
  config: CreateElementConfig = {}
): BookElement {
  const classnames = [styles.book].concat(config.classnames ?? []);
  const attributes = {
    ...(config.attributes ?? {}),
    tabindex: 0,
  };

  const book = div({
    ...config,
    classnames,
    attributes,
  }) as unknown as BookElement;

  book.elementTagIdentifier = elementTagIdentifier;
  book.media = media;

  book.destroy = destroy;

  return book;
}

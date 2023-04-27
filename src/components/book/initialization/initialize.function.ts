import styles from '../book.module.css';

import CreateElementConfig from '../../../elements/create-element.config';
import BookComponent from '../book.component';
import div from '../../../elements/div.function';

export default function initialize(
  config: CreateElementConfig = {}
): BookComponent {
  const classnames = [styles.book].concat(config.classnames ?? []);
  const attributes = {
    ...(config.attributes ?? {}),
    tabindex: 0,
  };

  return div({
    ...config,
    classnames,
    attributes,
  }) as unknown as BookComponent;
}

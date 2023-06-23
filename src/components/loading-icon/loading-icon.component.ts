import styles from './loading-icon.module.css';

import CreateElementConfig from '../../elements/create-element.config';
import div from '../../elements/div.function';
import merge from '../../utils/merge.function';
import LoadingIconElement from './loading-icon-element.interface';

/**
 * To show pages are being loaded, for example.
 */
export default function LoadingIconComponent(
  elementConfig: CreateElementConfig = {}
): LoadingIconElement {
  const loadingIcon = div(
    merge(
      {
        classnames: [styles.loadingIcon],
      },
      elementConfig
    )
  ) as unknown as LoadingIconElement;

  loadingIcon.prospero = {
    destroy: () => {
      loadingIcon.remove();
    },
    type: 'loading-icon',
  };

  return loadingIcon;
}

import styles from './loading-icon.module.css';

import CreateElementConfig from '../../elements/create-element.config';
import div from '../../elements/div.function';
import merge from '../../utils/merge.function';
import LoadingIconElement from './loading-icon-element.interface';
import LoadingIconIdentifier from './loading-icon.symbol';

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

  loadingIcon.destroy = () => {
    loadingIcon.remove();
  };
  loadingIcon.elementTagIdentifier = LoadingIconIdentifier;

  return loadingIcon;
}

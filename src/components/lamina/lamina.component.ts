import styles from './lamina.module.css';

import div from '../../elements/div.function';
import CreateLaminaElement from './create-lamina-element.interface';
import LaminaElement from './lamina-element.interface';
import LaminaIdentifier from './lamina.symbol';

/**
 * A lamina that stretches over the whole book. Utilities can be placed on the lamina that
 * are not part of the book such as loading icons, page pickers or bookmark managers.
 */
const LaminaComponent: CreateLaminaElement = () => {
  const laminaElement = div({
    classnames: [styles.lamina],
  }) as unknown as LaminaElement;

  laminaElement.elementTagIdentifier = LaminaIdentifier;
  laminaElement.destroy = () => {};

  return laminaElement;
};

export default LaminaComponent;

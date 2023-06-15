import styles from './lamina.module.css';

import div from '../../elements/div.function';
import merge from '../../utils/merge.function';
import CreateLaminaElement from './create-lamina-element.interface';
import LaminaElement from './lamina-element.interface';
import LaminaIdentifier from './lamina.symbol';

/**
 * A lamina that stretches over the whole book. Utilities can be placed on the lamina that
 * are not part of the book such as loading icons, page pickers or bookmark managers.
 */
const LaminaComponent: CreateLaminaElement = (elementConfig = {}) => {
  const laminaElement = div(
    merge(
      {
        classnames: [styles.lamina],
      },
      elementConfig
    )
  ) as unknown as LaminaElement;

  let killFocusLoop: (sign: Symbol) => void;

  const KillFocusLoopSwitch = Symbol(
    'Unique sign that denotes the focus event loop was destroyed deliberately.'
  );

  (async function focusEventLoop() {
    try {
      while (true) {
        await new Promise((resolve, reject) => {
          laminaElement.addEventListener('focusin', resolve, { once: true });

          killFocusLoop = reject;
        });

        laminaElement.classList.add(styles.laminaActive);

        await new Promise((resolve, reject) => {
          laminaElement.addEventListener('focusout', resolve, { once: true });

          killFocusLoop = reject;
        });

        await new Promise((resolve, reject) => {
          setTimeout(resolve, 1000);

          killFocusLoop = reject;
        });

        laminaElement.classList.remove(styles.laminaActive);
      }
    } catch (error) {
      if (error !== KillFocusLoopSwitch) {
        // Re-throw the error if it is not deliberate.
        throw error;
      }
    }
  })();

  laminaElement.elementTagIdentifier = LaminaIdentifier;
  laminaElement.destroy = () => {
    killFocusLoop(KillFocusLoopSwitch);

    laminaElement.remove();
  };

  return laminaElement;
};

export default LaminaComponent;

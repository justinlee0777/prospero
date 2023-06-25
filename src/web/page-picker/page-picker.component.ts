import styles from './page-picker.module.css';

import createKeydownListener from '../../elements/create-keydown-listener.function';
import input from '../../elements/input.function';
import merge from '../../utils/merge.function';
import CreatePagePickerElement from './create-page-picker-element.interface';
import PagePickerElement from './page-picker-element.interface';

const PagePickerComponent: CreatePagePickerElement = (elementConfig = {}) => {
  const pagePicker = input(
    'number',
    {
      minlength: 1,
    },
    merge(
      {
        classnames: [styles.pagePicker],
        aria: {
          label: 'Type in the page number and the book will flip to it.',
        },
      },
      elementConfig
    )
  ) as unknown as PagePickerElement;

  function stopPropagation(event: Event) {
    event.stopPropagation();
  }

  pagePicker.addEventListener('click', stopPropagation);

  function update() {
    if (pagePicker.value.match(/^\d+$/)) {
      pagePicker.onpagechange?.(Number(pagePicker.value));
    }
  }

  pagePicker.addEventListener('blur', update);

  const keydownListener = createKeydownListener({
    Enter: update,
  });
  pagePicker.addEventListener('keydown', keydownListener);

  pagePicker.prospero = {
    type: 'page-picker',
    destroy: () => {
      pagePicker.removeEventListener('click', stopPropagation);

      pagePicker.removeEventListener('blur', update);
      pagePicker.removeEventListener('keydown', keydownListener);

      pagePicker.remove();
    },
  };

  return pagePicker;
};

export default PagePickerComponent;

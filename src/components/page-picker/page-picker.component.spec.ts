jest.mock('../../utils/merge.function', () => (arg) => arg);

import div from '../../elements/div.function';
import PagePickerComponent from './page-picker.component';

describe('PagePickerComponent', () => {
  test('creates', () => {
    const component = PagePickerComponent();

    expect(component).toBeTruthy();

    expect(component.className.toString()).toBe('pagePicker');

    component.destroy();
  });

  test('does not propagate click events', () => {
    const component = PagePickerComponent();

    const parent = div({
      children: [component],
    });

    const clickSpy = jest.fn();

    parent.addEventListener('click', clickSpy);

    component.dispatchEvent(new MouseEvent('click'));

    expect(clickSpy).not.toHaveBeenCalled();

    parent.removeEventListener('click', clickSpy);

    component.destroy();
  });

  test('updates the client on blur events', () => {
    const component = PagePickerComponent();

    const onpagechange = jest.fn();

    component.onpagechange = onpagechange;

    // Invalid
    component.value = '';

    component.dispatchEvent(new Event('blur'));

    expect(onpagechange).not.toHaveBeenCalled();

    // Valid
    component.value = '1';

    component.dispatchEvent(new Event('blur'));

    expect(onpagechange).toHaveBeenCalledTimes(1);
    expect(onpagechange).toHaveBeenCalledWith(1);

    component.destroy();
  });

  test('updates the client on ENTER', () => {
    const component = PagePickerComponent();

    const onpagechange = jest.fn();

    component.onpagechange = onpagechange;

    // Invalid
    component.value = '';

    component.dispatchEvent(new KeyboardEvent('keydown'));

    expect(onpagechange).not.toHaveBeenCalled();

    // Invalid because the wrong key is pressed
    component.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

    expect(onpagechange).not.toHaveBeenCalled();

    // Valid
    component.value = '1';

    component.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));

    expect(onpagechange).toHaveBeenCalledTimes(1);
    expect(onpagechange).toHaveBeenCalledWith(1);

    component.destroy();
  });
});

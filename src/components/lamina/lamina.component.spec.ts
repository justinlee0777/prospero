jest.mock('../../utils/merge.function', () => (arg) => arg);

import LaminaComponent from './lamina.component';

describe('LaminaComponent', () => {
  test('creates', () => {
    const component = LaminaComponent();

    expect(component).toBeTruthy();
    expect(component.className.toString()).toBe('lamina');
  });
});

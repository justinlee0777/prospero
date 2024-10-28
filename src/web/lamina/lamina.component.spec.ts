jest.mock('../../utils/merge.function', () => (arg: any) => arg);

import LaminaComponent from './lamina.component';

describe('LaminaComponent', () => {
  test('creates', () => {
    const component = LaminaComponent();

    expect(component).toBeTruthy();
    expect(component.className.toString()).toBe('lamina');

    component.prospero.destroy();
  });

  test("creates a perpetual focus-blur loop that is destroyed at the end of the component's lifetime", async () => {
    jest.useFakeTimers();

    const component = LaminaComponent();

    component.dispatchEvent(new Event('focusin'));

    await Promise.resolve();

    expect(component.classList.toString()).toBe('lamina laminaActive');

    component.dispatchEvent(new Event('focusout'));

    await Promise.resolve();

    jest.advanceTimersByTime(1000);

    await Promise.resolve();

    expect(component.classList.toString()).toBe('lamina');

    component.dispatchEvent(new Event('focusin'));

    await Promise.resolve();

    expect(component.classList.toString()).toBe('lamina laminaActive');

    component.prospero.destroy();

    component.dispatchEvent(new Event('focusin'));

    await Promise.resolve();

    expect(component.classList.toString()).toBe('lamina laminaActive');
  });
});

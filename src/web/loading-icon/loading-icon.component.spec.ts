jest.mock('../../utils/merge.function', () => (arg) => arg);

import LoadingIconComponent from './loading-icon.component';

describe('LoadingIconComponent', () => {
  test('creates', () => {
    const component = LoadingIconComponent();

    expect(component).toBeTruthy();

    expect(component.className.toString()).toBe('loadingIcon');
  });
});

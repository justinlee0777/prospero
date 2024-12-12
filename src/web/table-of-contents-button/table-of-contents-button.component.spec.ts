jest.mock('../assets/toc.svg', () => '');

jest.mock('../../utils/merge.function', () => (arg: any) => arg);

import TableOfContentsButtonComponent from './table-of-contents-button.component';

describe('TableOfContentsButtonComponent', () => {
  test('creates', () => {
    const component = TableOfContentsButtonComponent();

    expect(component).toBeTruthy();

    expect(component.className.toString()).toBe('tableOfContentsButton');

    expect(component.tabIndex).toBe(0);

    component.prospero.destroy();
  });
});

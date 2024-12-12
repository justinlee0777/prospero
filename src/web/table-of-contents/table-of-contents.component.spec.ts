import TableOfContentsComponent from './table-of-contents.component';

describe('TableOfContentsComponent', () => {
  let tableOfContents: Parameters<typeof TableOfContentsComponent>[0];

  beforeEach(() => {
    tableOfContents = {
      sections: [
        {
          pageNumber: 10,
          title: 'foo',
        },
        {
          pageNumber: 20,
          title: 'bar',
        },
        {
          pageNumber: 30,
          title: 'baz',
        },
      ],
    };
  });

  test('creates', () => {
    const component = TableOfContentsComponent(tableOfContents);

    expect(component).toBeTruthy();

    expect(component.querySelector('.closeButton')).toBeTruthy();

    const sections = component.querySelectorAll('.tableOfContentsSection');

    expect(sections.length).toBe(3);

    expect(sections[0].textContent).toBe('foo (11)');

    expect(sections[1].textContent).toBe('bar (21)');

    expect(sections[2].textContent).toBe('baz (31)');

    component.prospero.destroy();
  });

  test('notifies client when pane closes', () => {
    const component = TableOfContentsComponent(tableOfContents);

    const spy = (component.onpaneclose = jest.fn());

    const closeButton = component.querySelector('.closeButton')! as HTMLElement;

    closeButton.click();

    expect(spy).toHaveBeenCalledTimes(1);

    component.prospero.destroy();
  });

  test('notifies client when page changes', () => {
    const component = TableOfContentsComponent(tableOfContents);

    const spy = (component.onpageselected = jest.fn());

    const sections = component.querySelectorAll(
      '.tableOfContentsSection'
    ) as NodeListOf<HTMLElement>;

    sections[0].click();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(10);

    sections[1].click();

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith(20);

    sections[2].click();

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledWith(30);

    component.prospero.destroy();
  });
});

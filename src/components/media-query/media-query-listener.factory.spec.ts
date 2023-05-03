jest.useFakeTimers();

import MediaQueryListenerFactory from './media-query-listener.factory';

describe('MediaQueryListenerFactory', () => {
  let oldInnerWidth: number;

  let oldMatchMedia: Window['matchMedia'];
  let media: Array<MediaQueryList>;

  beforeEach(() => {
    oldInnerWidth = window.innerWidth;

    oldMatchMedia = window.matchMedia;
    media = [];

    window.matchMedia = jest.fn().mockImplementation(() => {
      const queryList = {
        matches: false,
      };

      media.push(queryList as any);

      return queryList;
    });
  });

  afterEach(() => {
    window.innerWidth = oldInnerWidth;
    window.matchMedia = oldMatchMedia;
  });

  test('creates a listener for several viewport widths', () => {
    const values = Array(3);

    const foo = jest
      .fn()
      .mockImplementation(
        (state: boolean) => (values[0] = state ? 'show' : 'hide')
      );
    const bar = jest
      .fn()
      .mockImplementation(
        (state: boolean) => (values[1] = state ? 'show' : 'hide')
      );
    const baz = jest
      .fn()
      .mockImplementation(
        (state: boolean) => (values[2] = state ? 'show' : 'hide')
      );

    const destroy = MediaQueryListenerFactory.create(
      {
        show: () => foo(true),
        hide: () => foo(false),
      },
      {
        minWidth: 500,
        show: () => baz(true),
        hide: () => baz(false),
      },
      {
        minWidth: 800,
        show: () => bar(true),
        hide: () => bar(false),
      }
    );

    expect(media.length).toBe(2);
    const [barMedia, bazMedia] = media;

    expect(foo).toHaveBeenCalledTimes(1);
    expect(values).toEqual(['show', 'hide', 'hide']);

    (bazMedia as any).matches = true;
    window.dispatchEvent(new Event('resize'));

    jest.advanceTimersByTime(300);

    expect(values).toEqual(['hide', 'hide', 'show']);
    expect(baz).toHaveBeenCalledTimes(2);

    // No redundant calls

    jest.advanceTimersByTime(300);
    window.dispatchEvent(new Event('resize'));

    expect(values).toEqual(['hide', 'hide', 'show']);
    expect(baz).toHaveBeenCalledTimes(2);

    (bazMedia as any).matches = false;
    (barMedia as any).matches = true;

    jest.advanceTimersByTime(300);
    window.dispatchEvent(new Event('resize'));

    expect(values).toEqual(['hide', 'show', 'hide']);
    expect(bar).toHaveBeenCalledTimes(3);

    destroy();
  });
});

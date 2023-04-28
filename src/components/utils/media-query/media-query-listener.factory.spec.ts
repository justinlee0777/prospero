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
    let value: string;

    const foo = jest.fn().mockImplementation(() => (value = 'foo'));
    const bar = jest.fn().mockImplementation(() => (value = 'bar'));
    const baz = jest.fn().mockImplementation(() => (value = 'baz'));

    const destroy = MediaQueryListenerFactory.create(
      foo,
      {
        minWidth: 500,
        callback: baz,
      },
      {
        minWidth: 800,
        callback: bar,
      }
    );

    expect(media.length).toBe(2);
    const [barMedia, bazMedia] = media;

    expect(foo).toHaveBeenCalledTimes(1);
    expect(value).toBe('foo');

    (bazMedia as any).matches = true;
    window.dispatchEvent(new Event('resize'));

    jest.advanceTimersByTime(300);

    expect(value).toBe('baz');
    expect(baz).toHaveBeenCalledTimes(1);

    // No redundant calls

    jest.advanceTimersByTime(300);
    window.dispatchEvent(new Event('resize'));

    expect(value).toBe('baz');
    expect(baz).toHaveBeenCalledTimes(1);

    (bazMedia as any).matches = false;
    (barMedia as any).matches = true;

    jest.advanceTimersByTime(300);
    window.dispatchEvent(new Event('resize'));

    expect(value).toBe('bar');
    expect(bar).toHaveBeenCalledTimes(1);

    destroy();
  });
});

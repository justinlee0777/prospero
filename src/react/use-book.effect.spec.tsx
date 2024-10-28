jest.mock('../utils/merge.function', () => (arg: any) => arg);

jest.mock('picture-in-picture-js', () => ({}));

jest.mock('../web/assets/book-open-svgrepo-com.svg', () => '');

import renderer from 'react-test-renderer';

import { useRef } from 'react';
import { FlexibleBookComponent } from '../web';
import useBook from './use-book.effect';

describe('useBook', () => {
  let appendChildSpy: jest.Mock;

  function UseBookTest(props: any): JSX.Element {
    props ||= {};

    const { classname, noBook } = props;

    const ref = useRef<HTMLDivElement>(null);

    useBook(
      ref,
      () => {
        if (noBook) {
          return null;
        }

        const component = FlexibleBookComponent({
          pageStyles: {
            lineHeight: 32,
            computedFontSize: '16px',
            computedFontFamily: 'Arial',
          },
          text: 'Foo\nBar\nBaz',
          config: {},
        });
        component.className = classname;

        return component;
      },
      [classname, noBook]
    );

    return <div ref={ref}></div>;
  }

  beforeEach(() => {
    window.ResizeObserver = class MockResizeObserver {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    };
  });

  function createMockContainer() {
    appendChildSpy = jest.fn();

    return {
      appendChild: appendChildSpy,
    };
  }

  test('adds a book', async () => {
    let component;
    await renderer.act(() => {
      component = renderer.create(<UseBookTest />, {
        createNodeMock: createMockContainer,
      });
    });

    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    const [book] = appendChildSpy.mock.calls.at(0);
    expect(book instanceof HTMLElement).toBe(true);
  });

  test('adds a book with a dependency', async () => {
    let component: renderer.ReactTestRenderer;
    await renderer.act(() => {
      component = renderer.create(<UseBookTest classname="foo" />, {
        createNodeMock: createMockContainer,
      });
    });

    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    let [book] = appendChildSpy.mock.calls.at(0);
    expect(book instanceof HTMLElement).toBe(true);

    expect(book.className).toBe('foo');

    await renderer.act(() => {
      component.update(<UseBookTest classname="bar" />);
    });
    expect(appendChildSpy).toHaveBeenCalledTimes(2);
    [book] = appendChildSpy.mock.calls.at(1);
    expect(book instanceof HTMLElement).toBe(true);

    expect(book.className).toBe('bar');
  });

  test('does not add a book', async () => {
    let component;
    await renderer.act(() => {
      component = renderer.create(<UseBookTest noBook={true} />, {
        createNodeMock: createMockContainer,
      });
    });

    expect(appendChildSpy).not.toHaveBeenCalled();
  });
});

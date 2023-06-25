import initialize from './initialize.function';

describe('BookComponent initialize()', () => {
  test('creates a BookComponent', () => {
    const destroy = jest.fn();

    const book = initialize({
      media: {
        minWidth: 600,
      },
      prospero: {
        destroy,
        type: 'book',
      },
    });

    expect(book).toBeTruthy();

    expect('tagName' in book).toBe(true);

    expect(book.prospero.type).toBe('book');
    expect(book.media).toEqual({
      minWidth: 600,
    });

    book.prospero.destroy();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test('creates a BookComponent with element arguments', () => {
    const destroy = jest.fn();

    const book = initialize(
      {
        prospero: {
          destroy,
          type: 'book',
        },
      },
      {
        classnames: ['foo', 'bar'],
        styles: {
          color: 'red',
        },
      }
    );

    expect(book.classList.toString()).toBe('foo bar');
    expect(book.style.color).toBe('red');
  });
});

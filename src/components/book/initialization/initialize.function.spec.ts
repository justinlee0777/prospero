import BookSymbol from '../book.symbol';
import initialize from './initialize.function';

describe('BookComponent initialize()', () => {
  test('creates a BookComponent', () => {
    const destroy = jest.fn();

    const book = initialize({
      elementTagIdentifier: BookSymbol,
      media: {
        minWidth: 600,
      },
      destroy,
    });

    expect(book).toBeTruthy();

    expect('tagName' in book).toBe(true);

    expect(book.elementTagIdentifier).toBe(BookSymbol);
    expect(book.media).toEqual({
      minWidth: 600,
    });

    book.destroy();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test('creates a BookComponent with element arguments', () => {
    const destroy = jest.fn();

    const book = initialize(
      {
        elementTagIdentifier: BookSymbol,
        destroy,
      },
      {
        classnames: ['foo', 'bar'],
        styles: {
          color: 'red',
        },
      }
    );

    expect(book.classList.toString()).toBe('book foo bar');
    expect(book.style.color).toBe('red');
  });
});

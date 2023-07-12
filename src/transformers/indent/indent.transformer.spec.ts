import IndentTransformer from './indent.transformer';

describe('IndentTransformer', () => {
  test('sets indentation for the book', () => {
    const transformer = new IndentTransformer(4);

    expect(transformer.transform('Foo\nBar\n\nBaz')).toBe(
      '    Foo\n    Bar\n\n    Baz'
    );
  });

  test('does not set indentation for the beginning of the book', () => {
    const transformer = new IndentTransformer(4);

    expect(transformer.transform('\nFoo')).toBe('\n    Foo');
  });

  test('sets indentation into HTML blocks', () => {
    const transformer = new IndentTransformer(4);
    transformer.forHTML = true;

    expect(transformer.transform('<div>Foo</div>')).toBe('<div>    Foo</div>');
  });
});

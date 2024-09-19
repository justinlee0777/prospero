import IndentTransformer from './indent.transformer';

describe('IndentTransformer', () => {
  test('sets indentation for the book', () => {
    const transformer = new IndentTransformer(4, { htmlCompatible: false });

    expect(transformer.transform('Foo\nBar\n\nBaz')).toBe(
      '    Foo\n    Bar\n    \n    Baz'
    );
  });

  test('sets indentation into HTML blocks', () => {
    const transformer = new IndentTransformer(4);

    // The transformer only recognizes HTML.
    expect(transformer.transform('Foo')).toBe('&nbsp;&nbsp;&nbsp;&nbsp;Foo');

    expect(transformer.transform('<div>Foo</div>')).toBe(
      '<div>&amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;Foo</div>'
    );
  });
});

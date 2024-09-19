import NewlineTransformer from './newline.transformer';

describe('NewlineTransformer', () => {
  test('adds newlines', () => {
    const transformer = new NewlineTransformer();

    expect(transformer.transform('Foo\nBar\nBaz')).toBe('Foo\n\nBar\n\nBaz');
  });

  test('configures the number of newlines added', () => {
    const transformer = new NewlineTransformer({
      betweenParagraphs: 4,
    });

    expect(transformer.transform('Foo\nBar\nBaz')).toBe(
      'Foo\n\n\n\n\nBar\n\n\n\n\nBaz'
    );
  });

  test('allows zero newlines added', () => {
    const transformer = new NewlineTransformer({
      betweenParagraphs: 0,
    });

    // Essentially idempotent.
    expect(transformer.transform('Foo\nBar\nBaz')).toBe('Foo\nBar\nBaz');
  });

  test('adds newlines in the beginning to break off sections', () => {
    const transformer = new NewlineTransformer({
      beginningSections: 4,
    });

    expect(transformer.transform('Foo\nBar\nBaz')).toBe(
      '\n\n\n\nFoo\n\nBar\n\nBaz'
    );
  });

  test('sets newlines for HTML', () => {
    const transformer = new NewlineTransformer({
      beginningSections: 2,
      betweenParagraphs: 1,
    });

    // The transformer only recognizes HTML.
    expect(transformer.transform('Foo\nBar\nBaz')).toEqual(
      '\n\nFoo\n\nBar\n\nBaz'
    );

    expect(
      transformer.transform('<div>Foo</div><div>Bar</div><div>Baz</div>')
    ).toEqual('<div>\n\nFoo</div><div>\nBar</div><div>\nBaz</div>');
  });
});

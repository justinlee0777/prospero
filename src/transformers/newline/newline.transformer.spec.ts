import NewlineTransformer from './newline.transformer';

describe('NewlineTransformer', () => {
  test('adds newlines', () => {
    const transformer = new NewlineTransformer();

    expect(transformer.transform('Foo\nBar\nBaz')).toBe('Foo\n\nBar\n\nBaz');
  });
});

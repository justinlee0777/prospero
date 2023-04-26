import sanitize from './html.sanitizer';

describe('HTMLSanitizer', () => {
  test('sanitizes', () => {
    /*
     * Current spec is:
     * - Only <span> is allowed.
     * - Only "style" attribute is allowed, and only the "color" value.
     */
    const paragraphElement = '<p>foo</p>';

    expect(sanitize(paragraphElement)).toBe('foo');

    const imageElement = '<img/>';

    expect(sanitize(imageElement)).toBe('');

    const spanElement = '<span>bar</span>';

    expect(sanitize(spanElement)).toBe('<span>bar</span>');

    const spanElementWithClassname = '<span class="inline">baz</span>';

    expect(sanitize(spanElementWithClassname)).toBe('<span>baz</span>');

    const spanElementWithColorAndBackgroundColor =
      '<span style="color: red; background-color: blue;">baz</span>';

    expect(sanitize(spanElementWithColorAndBackgroundColor)).toBe(
      '<span style="color:red">baz</span>'
    );

    const spanElementWithHexColor = '<span style="color: #EFEFEF">baz</span>';

    expect(sanitize(spanElementWithHexColor)).toBe(
      '<span style="color:#EFEFEF">baz</span>'
    );
  });
});

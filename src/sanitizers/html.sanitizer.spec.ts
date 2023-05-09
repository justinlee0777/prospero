import sanitize from './html.sanitizer';

describe('HTMLSanitizer', () => {
  test('sanitizes', () => {
    /*
     * Current spec is:
     * - Only <a>, <code>, <del>, <em>, <pre>, <span>, <strong> is allowed.
     * - Only "style" and "href" attributes are allowed
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
      '<span style="color: red; background-color: blue;">baz</span>'
    );

    const spanElementWithHexColor = '<span style="color: #EFEFEF">baz</span>';

    expect(sanitize(spanElementWithHexColor)).toBe(
      '<span style="color: #EFEFEF">baz</span>'
    );

    const anchorElement =
      '<a href="https://example.com" rel="noopener">Link</a>';

    expect(sanitize(anchorElement)).toBe(
      '<a href="https://example.com">Link</a>'
    );

    const codeElement = '<code>const foo = "foo";</code>';

    expect(sanitize(codeElement)).toBe('<code>const foo = "foo";</code>');

    const strongElement = '<strong>emphasized</strong>';

    expect(sanitize(strongElement)).toBe('<strong>emphasized</strong>');

    const italicizedElement = '<em>bar</em>';

    expect(sanitize(italicizedElement)).toBe('<em>bar</em>');
  });
});

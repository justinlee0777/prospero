import ServerHTMLSanitizer from './html.sanitizer.server';
import WebHTMLSanitizer from './html.sanitizer.web';

describe('HTMLSanitizer', () => {
  [ServerHTMLSanitizer, WebHTMLSanitizer].forEach((Sanitizer) => {
    test('sanitizes', () => {
      const sanitizer = new Sanitizer();

      /*
       * Current spec is:
       * - Only <a>, <code>, <del>, <em>, <pre>, <span>, <strong> is allowed.
       * - Only "style" and "href" attributes are allowed
       */
      const paragraphElement = '<p>foo</p>';

      expect(sanitizer.sanitize(paragraphElement)).toBe('foo');

      const imageElement = '<img/>';

      expect(sanitizer.sanitize(imageElement)).toBe('');

      const spanElement = '<span>bar</span>';

      expect(sanitizer.sanitize(spanElement)).toBe('<span>bar</span>');

      const spanElementWithClassname = '<span class="inline">baz</span>';

      expect(sanitizer.sanitize(spanElementWithClassname)).toBe(
        '<span>baz</span>'
      );

      const spanElementWithColorAndBackgroundColor =
        '<span style="color: red; background-color: blue;">baz</span>';

      expect(sanitizer.sanitize(spanElementWithColorAndBackgroundColor)).toBe(
        '<span style="color: red; background-color: blue;">baz</span>'
      );

      const spanElementWithHexColor = '<span style="color: #EFEFEF">baz</span>';

      expect(sanitizer.sanitize(spanElementWithHexColor)).toBe(
        '<span style="color: #EFEFEF">baz</span>'
      );

      const anchorElement =
        '<a href="https://example.com" rel="noopener">Link</a>';

      expect(sanitizer.sanitize(anchorElement)).toBe(
        '<a href="https://example.com">Link</a>'
      );

      const codeElement = '<code>const foo = "foo";</code>';

      expect(sanitizer.sanitize(codeElement)).toBe(
        '<code>const foo = "foo";</code>'
      );

      const strongElement = '<strong>emphasized</strong>';

      expect(sanitizer.sanitize(strongElement)).toBe(
        '<strong>emphasized</strong>'
      );

      const italicizedElement = '<em>bar</em>';

      expect(sanitizer.sanitize(italicizedElement)).toBe('<em>bar</em>');
    });
  });
});

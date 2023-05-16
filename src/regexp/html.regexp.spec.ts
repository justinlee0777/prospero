import createHTMLRegex from './html.regexp';

describe('HTMLRegex', () => {
  test('match tags', () => {
    const HTMLRegex = createHTMLRegex();

    // mismatch
    expect('foo'.matchAll(HTMLRegex).next().value).toBeUndefined();

    // not closed
    expect('<p>foo'.matchAll(HTMLRegex).next().value).toBeUndefined();

    // mismatching tags
    expect('<p>foo</span>'.matchAll(HTMLRegex).next().value).toBeUndefined();

    // Do not match <img/> tags (for now)
    expect('<img/>'.matchAll(HTMLRegex).next().value).toBeUndefined();

    // Nested tags don't really work (for now)
    expect(
      '<p><span>foo</span></p>'.matchAll(HTMLRegex).next().value.slice()
    ).toEqual(['<p><span>foo</span></p>', '<p><span>foo</span>', 'p', '']);

    // <p> tags
    expect('<p>foo</p>'.matchAll(HTMLRegex).next().value.slice()).toEqual([
      '<p>foo</p>',
      '<p>',
      'p',
      'foo',
    ]);

    // <span> tags
    expect('<span>bar</span>'.matchAll(HTMLRegex).next().value.slice()).toEqual(
      ['<span>bar</span>', '<span>', 'span', 'bar']
    );

    // <p> tags with style and aria-label
    expect(
      '<p style="margin: 0" aria-label="bar">foo</p>'
        .matchAll(HTMLRegex)
        .next()
        .value.slice()
    ).toEqual([
      '<p style="margin: 0" aria-label="bar">foo</p>',
      '<p style="margin: 0" aria-label="bar">',
      'p',
      'foo',
    ]);
  });

  test('match <p> tags', () => {
    const PRegex = createHTMLRegex('p');

    // <span> tags
    expect('<span>bar</span>'.matchAll(PRegex).next().value).toBeUndefined();

    // <p> tags
    expect('<p>foo</p>'.matchAll(PRegex).next().value.slice()).toEqual([
      '<p>foo</p>',
      '<p>',
      'p',
      'foo',
    ]);

    // <p> tags with style and aria-label
    expect(
      '<p style="margin: 0" aria-label="bar">foo</p>'
        .matchAll(PRegex)
        .next()
        .value.slice()
    ).toEqual([
      '<p style="margin: 0" aria-label="bar">foo</p>',
      '<p style="margin: 0" aria-label="bar">',
      'p',
      'foo',
    ]);
  });
});

import createHTMLRegex from './html.regexp';

describe('HTMLRegex', () => {
  test('match tags', () => {
    const HTMLRegex = createHTMLRegex();

    // mismatch
    expect('foo'.matchAll(HTMLRegex).next().value).toBeUndefined();

    // not closed
    expect('<p>foo'.matchAll(HTMLRegex).next().value.slice()).toEqual([
      '<p>',
      '<p>',
      'p',
      undefined,
      undefined,
    ]);

    // mismatching tags
    expect('<p>foo</span>'.matchAll(HTMLRegex).next().value.slice()).toEqual([
      '<p>',
      '<p>',
      'p',
      undefined,
      undefined,
    ]);

    expect('<img/>'.matchAll(HTMLRegex).next().value.slice()).toEqual([
      '<img/>',
      '<img/>',
      'img',
      undefined,
      undefined,
    ]);

    // Nested tags don't really work (for now)
    expect(
      '<p><span>foo</span></p>'.matchAll(HTMLRegex).next().value.slice()
    ).toEqual([
      '<p><span>foo</span></p>',
      '<p>',
      'p',
      '<span>foo</span>',
      '</p>',
    ]);

    // <p> tags
    expect('<p>foo</p>'.matchAll(HTMLRegex).next().value.slice()).toEqual([
      '<p>foo</p>',
      '<p>',
      'p',
      'foo',
      '</p>',
    ]);

    // <span> tags
    expect('<span>bar</span>'.matchAll(HTMLRegex).next().value.slice()).toEqual(
      ['<span>bar</span>', '<span>', 'span', 'bar', '</span>']
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
      '</p>',
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
      '</p>',
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
      '</p>',
    ]);
  });

  test('match <hr> elements', () => {
    const HRRegex = createHTMLRegex('hr');

    // <hr> closed tags
    expect('<hr>foo</hr>'.matchAll(HRRegex).next().value.slice()).toEqual([
      '<hr>foo</hr>',
      '<hr>',
      'hr',
      'foo',
      '</hr>',
    ]);

    // <img/> tags
    expect('<img/>'.matchAll(HRRegex).next().value).toBeUndefined();

    // <hr>
    expect('<hr>'.matchAll(HRRegex).next().value.slice()).toEqual([
      '<hr>',
      '<hr>',
      'hr',
    ]);

    // <hr/>
    expect('<hr/>'.matchAll(HRRegex).next().value.slice()).toEqual([
      '<hr/>',
      '<hr/>',
      'hr',
    ]);
  });
});

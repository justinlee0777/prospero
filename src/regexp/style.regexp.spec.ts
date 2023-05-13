import StyleRegexp from './style.regexp';

describe('StyleRegexp', () => {
  test('match style attribute', () => {
    // Not matching at all
    expect([...'foo'.matchAll(StyleRegexp)]).toEqual([]);

    expect([...'style='.matchAll(StyleRegexp)]).toEqual([]);

    // Quotations need to match
    expect([...`style="foo'`.matchAll(StyleRegexp)]).toEqual([]);

    expect([...`style='foo"`.matchAll(StyleRegexp)]).toEqual([]);

    // Matching
    expect(
      [...`style="foo"`.matchAll(StyleRegexp)].map((match) => match.slice(0))
    ).toEqual([['style="foo"', '"', 'foo']]);
  });
});

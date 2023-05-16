import StyleValueRegexp from './style-value.regexp';

describe('StyleValueRegexp', () => {
  test('match style values', () => {
    // No match
    expect([...'foo'.matchAll(StyleValueRegexp)]).toEqual([]);

    expect([...'foo: '.matchAll(StyleValueRegexp)]).toEqual([]);

    // Matching
    expect(
      [...'display: block'.matchAll(StyleValueRegexp)].map((match) =>
        match.slice()
      )
    ).toEqual([['display: block', 'display', 'block']]);

    expect(
      [...'display: block; font-size: 18px;'.matchAll(StyleValueRegexp)].map(
        (match) => match.slice()
      )
    ).toEqual([
      ['display: block;', 'display', 'block'],
      ['font-size: 18px;', 'font-size', '18px'],
    ]);
  });
});

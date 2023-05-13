import extractStyles from './extract-styles.function';

describe('extractStyles()', () => {
  test('return nothing with an HTML string without a "style" attribute', () => {
    expect(extractStyles('<span width=180 height=120>')).toBeNull();
  });

  test('returns nothing with an HTML string with an empty "style" attribute', () => {
    expect(extractStyles('<span style="">')).toBeNull();
  });

  test('returns nothing with an HTML string with font-irrelevant styles', () => {
    expect(
      extractStyles(
        '<span style="display: block; transform: translateX(-100%)">'
      )
    ).toBeNull();
  });

  test('returns a mapping of only valid font styles', () => {
    expect(extractStyles('<span style="font-size: 32px">')).toEqual({
      'font-size': '32px',
    });

    expect(extractStyles('<span style="font-weight: bold">')).toEqual({
      'font-weight': 'bold',
    });

    expect(
      extractStyles('<span style="font-size: 32px; font-weight: bold">')
    ).toEqual({
      'font-size': '32px',
      'font-weight': 'bold',
    });
  });
});

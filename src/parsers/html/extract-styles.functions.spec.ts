import extractStyles from './extract-styles.function';

describe('extractStyles()', () => {
  test('returns nothing with an HTML string without a "style" attribute', () => {
    expect(extractStyles('<span width=180 height=120>')).toEqual({
      font: null,
      block: null,
    });
  });

  test('returns nothing with an HTML string with an empty "style" attribute', () => {
    expect(extractStyles('<span style="">')).toEqual({
      font: null,
      block: null,
    });
  });

  test('returns nothing with an HTML string with font-irrelevant styles', () => {
    expect(
      extractStyles(
        '<span style="display: block; transform: translateX(-100%)">'
      ).font
    ).toBeNull();
  });

  test('returns nothing with an HTML string with block-irrelevant styles', () => {
    expect(
      extractStyles(
        '<div style="display: block; transform: translateX(-100%)">'
      ).block
    ).toBeNull();
  });

  test('returns a mapping of only valid font styles', () => {
    expect(extractStyles('<span style="font-size: 32px">').font).toEqual({
      'font-size': '32px',
    });

    expect(extractStyles('<span style="font-weight: bold">').font).toEqual({
      'font-weight': 'bold',
    });

    expect(
      extractStyles('<span style="font-size: 32px; font-weight: bold">').font
    ).toEqual({
      'font-size': '32px',
      'font-weight': 'bold',
    });
  });

  test('returns a mapping of only valid block styles', () => {
    expect(extractStyles('<div style="margin: 0 0 32px">').block).toEqual({
      margin: '0 0 32px',
    });

    expect(extractStyles('<span style="margin: 8px">').block).toEqual({
      margin: '8px',
    });
  });
});

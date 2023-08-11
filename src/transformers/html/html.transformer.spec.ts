import HTMLTransformer from './html.transformer';

describe('HTMLTransformer', () => {
  let transformer: HTMLTransformer;

  beforeEach(() => {
    transformer = new HTMLTransformer({ fontSize: 18 });
  });

  test('transforms H1 tags', () => {
    expect(transformer.transform('<h1>foo</h1>')).toBe(
      '<div style="white-space: pre-wrap; display: inline-block; margin: 0; font-weight: bold; font-size: 36px">foo</div>'
    );
  });

  test('transforms H2 tags', () => {
    expect(transformer.transform('<h2>foo</h2>')).toBe(
      '<div style="white-space: pre-wrap; display: inline-block; margin: 0; font-weight: bold; font-size: 27px">foo</div>'
    );
  });

  test('transforms H3 tags', () => {
    expect(transformer.transform('<h3>foo</h3>')).toBe(
      '<div style="white-space: pre-wrap; display: inline-block; margin: 0; font-weight: bold; font-size: 21.06px">foo</div>'
    );
  });

  test('transforms H4 tags', () => {
    expect(transformer.transform('<h4>foo</h4>')).toBe(
      '<div style="white-space: pre-wrap; display: inline-block; margin: 0; font-weight: bold">foo</div>'
    );
  });

  test('transforms H5 tags', () => {
    expect(transformer.transform('<h5>foo</h5>')).toBe(
      '<div style="white-space: pre-wrap; display: inline-block; margin: 0; font-weight: bold; font-size: 14.94px">foo</div>'
    );
  });

  test('transforms H6 tags', () => {
    expect(transformer.transform('<h6>foo</h6>')).toBe(
      '<div style="white-space: pre-wrap; display: inline-block; margin: 0; font-weight: bold; font-size: 12.06px">foo</div>'
    );
  });

  test('transform HR tags', () => {
    expect(transformer.transform('<hr/>')).toBe(
      '<div style="white-space: pre-wrap; display: inline-block; text-align: center; width: 100%">* * *</div>'
    );

    transformer = new HTMLTransformer({ fontSize: 18 }, { hrString: '- - -' });

    expect(transformer.transform('<hr/>')).toBe(
      '<div style="white-space: pre-wrap; display: inline-block; text-align: center; width: 100%">- - -</div>'
    );
  });

  test('transforms blockquote tags', () => {
    expect(transformer.transform('<blockquote>foo</blockquote>')).toBe(
      '<div style="margin: 0 36px;">foo</div>'
    );
  });

  test('transforms p tags', () => {
    expect(transformer.transform('<p>foo</p>')).toBe(
      '<div style="white-space: pre-wrap; margin: 0;">foo</div>'
    );
  });

  test('transforms entire text', () => {
    const text = '<h1>foo</h1>' + '<h2>bar</h2>' + '<h3>baz</h3>';

    expect(transformer.transform(text)).toBe(
      '<div style="white-space: pre-wrap; display: inline-block; margin: 0; font-weight: bold; font-size: 36px">foo</div>' +
        '<div style="white-space: pre-wrap; display: inline-block; margin: 0; font-weight: bold; font-size: 27px">bar</div>' +
        '<div style="white-space: pre-wrap; display: inline-block; margin: 0; font-weight: bold; font-size: 21.06px">baz</div>'
    );
  });
});

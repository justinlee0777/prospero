import getMargin from './get-margin.function';

describe('getMargin', () => {
  test('gets the margin values from 4 values', () => {
    expect(getMargin('1px 2px 3px 4px')).toEqual({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    });
  });

  test('gets the margin values from 3 values', () => {
    expect(getMargin('8px 12px 4px')).toEqual({
      top: 8,
      right: 12,
      bottom: 4,
      left: 12,
    });
  });

  test('gets the margin values from 2 values', () => {
    expect(getMargin('16px 8px')).toEqual({
      top: 16,
      right: 8,
      bottom: 16,
      left: 8,
    });
  });

  test('gets the margin values from 1 values', () => {
    expect(getMargin('12px')).toEqual({
      top: 12,
      right: 12,
      bottom: 12,
      left: 12,
    });
  });
});

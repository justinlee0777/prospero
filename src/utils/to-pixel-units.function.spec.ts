import toPixelUnits from './to-pixel-units.function';

describe('toPixelUnits', () => {
  test('converts string values to numbers measured in pixels', () => {
    expect(toPixelUnits('1px')).toBe(1);
    expect(toPixelUnits('12px')).toBe(12);
    expect(toPixelUnits('24px')).toBe(24);
  });

  test('throws an error if the value is not in pixels', () => {
    expect(() => toPixelUnits('foo')).toThrow();
    expect(() => toPixelUnits('1em')).toThrow();
    expect(() => toPixelUnits('12')).toThrow();
    expect(() => toPixelUnits('px')).toThrow();
  });
});

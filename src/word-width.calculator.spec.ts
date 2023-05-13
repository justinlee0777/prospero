import WordWidthCalculator from './word-width.calculator';

describe('WordWidthCalculator', () => {
  test('calculates word widths for Arial in 16px size', () => {
    const calculator = new WordWidthCalculator('16px', 'Arial', 32);

    expect(calculator.calculate(' ')).toBe(4.4453125);

    expect(calculator.calculate('foo')).toBe(22.2421875);

    expect(calculator.calculate('bar')).toBe(23.125);

    expect(calculator.calculate('baz')).toBe(25.796875);
  });

  test('calculates word widths for Arial in 12px size', () => {
    const calculator = new WordWidthCalculator('12px', 'Arial', 18);

    expect(calculator.calculate(' ')).toBe(3.333984375);

    expect(calculator.calculate('foo')).toBe(16.681640625);

    expect(calculator.calculate('bar')).toBe(17.34375);

    expect(calculator.calculate('baz')).toBe(19.34765625);
  });

  test('calculates word widths for Times New Roman in 16px size', () => {
    const calculator = new WordWidthCalculator('16px', 'Times New Roman', 24);

    expect(calculator.calculate(' ')).toBe(4);

    expect(calculator.calculate('foo')).toBe(21.328125);

    expect(calculator.calculate('bar')).toBe(20.4296875);

    expect(calculator.calculate('baz')).toBe(22.203125);
  });
});

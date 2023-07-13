import IWordWidthCalculator from './word-width-calculator.interface';
import ServerWordWidthCalculator from './word-width.calculator.server';
import WebWordWidthCalculator from './word-width.calculator.web';

const tests: Array<
  [
    string,
    {
      new (
        size: string,
        family: string,
        lineHeight: number
      ): IWordWidthCalculator;
    }
  ]
> = [
  ['Server WordWidthCalculator', ServerWordWidthCalculator],
  ['Web WordWidthCalculator', WebWordWidthCalculator],
];

tests.forEach(([suiteName, WordWidthCalculator]) => {
  describe(suiteName, () => {
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

    test('changes font size and weight and resets back to the original setting', () => {
      const calculator = new WordWidthCalculator('16px', 'Arial', 32);

      calculator.apply({
        'font-size': '24px',
        'font-weight': 'bold',
      });

      expect(calculator.calculate(' ')).toBe(6.66796875);

      expect(calculator.calculate('foo')).toBe(37.3125);

      expect(calculator.calculate('bar')).toBe(37.34765625);

      expect(calculator.calculate('baz')).toBe(40.0078125);

      calculator.reset();

      expect(calculator.calculate(' ')).toBe(4.4453125);

      expect(calculator.calculate('foo')).toBe(22.2421875);

      expect(calculator.calculate('bar')).toBe(23.125);

      expect(calculator.calculate('baz')).toBe(25.796875);
    });
  });

  test('changes font family and resets', () => {
    const calculator = new WordWidthCalculator('16px', 'Arial', 32);

    calculator.apply({
      'font-family': 'monospace',
    });

    expect(calculator.calculate(' ')).toBe(9.6015625);

    expect(calculator.calculate('foo')).toBe(28.8046875);

    expect(calculator.calculate('bar')).toBe(28.8046875);

    expect(calculator.calculate('baz')).toBe(28.8046875);

    calculator.reset();

    expect(calculator.calculate(' ')).toBe(4.4453125);

    expect(calculator.calculate('foo')).toBe(22.2421875);

    expect(calculator.calculate('bar')).toBe(23.125);

    expect(calculator.calculate('baz')).toBe(25.796875);
  });
});

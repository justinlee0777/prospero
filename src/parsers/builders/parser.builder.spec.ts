let mockParser: Parser;
let mockHTMLParser: Parser;

const mockParserFactory = {
  create: jest.fn().mockImplementation(
    () =>
      (mockParser = {
        setCalculator: jest.fn(),
        setTransformers: jest.fn(),
      } as any)
  ),
  createForHTML: jest.fn().mockImplementation(
    () =>
      (mockHTMLParser = {
        setCalculator: jest.fn(),
        setTransformers: jest.fn(),
      } as any)
  ),
};

jest.mock('../parser.factory.server', () => mockParserFactory);

jest.mock('../parser.factory.web', () => mockParserFactory);

let MockWordWidthCalculatorConstructor;

class MockWordWidthCalculator {
  constructor(...args) {
    MockWordWidthCalculatorConstructor = jest.fn();
    MockWordWidthCalculatorConstructor(...args);
  }
}

jest.mock('../../word-width.calculator.server', () => MockWordWidthCalculator);

jest.mock('../../word-width.calculator.web', () => MockWordWidthCalculator);

import Transformer from '../../transformers/models/transformer.interface';
import Parser from '../models/parser.interface';
import ServerParserBuilder from './parser.builder.server';
import WebParserBuilder from './parser.builder.web';

const tests: Array<[string, any]> = [
  ['Server ParserBuilder', ServerParserBuilder],
  ['Web ParserBuilder', WebParserBuilder],
];

tests.forEach(([suiteName, ParserBuilder]) => {
  describe(suiteName, () => {
    class MockTransformer implements Transformer {
      forHTML = false;
      transform = jest.fn();
    }

    let containerStyle;

    beforeEach(() => {
      containerStyle = {
        width: 600,
        height: 400,
        lineHeight: 24,
        computedFontFamily: 'Times New Roman',
        computedFontSize: '16px',
      };
    });

    test('should build a parser', () => {
      expect(new ParserBuilder().fromPageStyles(containerStyle).build()).toBe(
        mockParser
      );
    });

    test('should build a parser with processors', () => {
      const processor = new MockTransformer();

      expect(
        new ParserBuilder()
          .fromPageStyles(containerStyle)
          .setTransformers([processor])
          .build()
      ).toBe(mockParser);

      expect(new ParserBuilder().fromPageStyles(containerStyle).build()).toBe(
        mockParser
      );
    });

    test('should build a parser using a custom font', () => {
      containerStyle = {
        ...containerStyle,
        computedFontFamily: 'Bookerly',
      };

      expect(
        new ParserBuilder()
          .fromPageStyles(containerStyle)
          .setFontLocation('/Bookerly.tiff')
          .build()
      ).toBe(mockParser);

      expect(MockWordWidthCalculatorConstructor).toHaveBeenCalledTimes(1);
      expect(MockWordWidthCalculatorConstructor).toHaveBeenCalledWith(
        '16px',
        'Bookerly',
        24,
        '/Bookerly.tiff'
      );

      expect(new ParserBuilder().fromPageStyles(containerStyle).build()).toBe(
        mockParser
      );
    });

    test('should build a parser for HTML', () => {
      expect(
        new ParserBuilder().fromPageStyles(containerStyle).forHTML().build()
      ).toBe(mockHTMLParser);
    });
  });
});

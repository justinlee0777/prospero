let mockParser: Parser;
let mockHTMLParser: Parser;

jest.mock('../parser.factory', () => {
  return {
    create: jest.fn().mockImplementation(
      () =>
        (mockParser = {
          setCalculator: jest.fn(),
          setProcessors: jest.fn(),
        } as any)
    ),
    createForHTML: jest.fn().mockImplementation(
      () =>
        (mockHTMLParser = {
          setCalculator: jest.fn(),
          setProcessors: jest.fn(),
        } as any)
    ),
  };
});

let MockWordWidthCalculatorConstructor;

jest.mock('../../word-width.calculator', () => {
  return class MockWordWidthCalculator {
    constructor(...args) {
      MockWordWidthCalculatorConstructor = jest.fn();
      MockWordWidthCalculatorConstructor(...args);
    }
  };
});

import Processor from '../../processors/models/processor.interface';
import Parser from '../models/parser.interface';
import ParserBuilder from './parser.builder';

describe('ParserBuilder', () => {
  class MockProcessor implements Processor {
    configure = jest.fn();
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
    expect(new ParserBuilder().fromContainerStyle(containerStyle).build()).toBe(
      mockParser
    );
  });

  test('should build a parser with processors', () => {
    const processor = new MockProcessor();

    expect(
      new ParserBuilder()
        .fromContainerStyle(containerStyle)
        .setProcessors([processor])
        .build()
    ).toBe(mockParser);

    expect(processor.configure).toHaveBeenCalledTimes(1);

    expect(new ParserBuilder().fromContainerStyle(containerStyle).build()).toBe(
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
        .fromContainerStyle(containerStyle)
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

    expect(new ParserBuilder().fromContainerStyle(containerStyle).build()).toBe(
      mockParser
    );
  });

  test('should build a parser for HTML', () => {
    expect(
      new ParserBuilder().fromContainerStyle(containerStyle).forHTML().build()
    ).toBe(mockHTMLParser);
  });
});

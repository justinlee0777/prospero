const mockParser: Parser = {
  setCalculator: jest.fn(),
  setProcessors: jest.fn(),
} as any;

jest.mock('../parser.factory', () => {
  return {
    create: jest.fn().mockReturnValue(mockParser),
  };
});

import Processor from '../../processors/models/processor.interface';
import Parser from '../models/parser.interface';
import ParserBuilder from './parser.builder';

describe('ParserBuilder', () => {
  class MockProcessor implements Processor {
    configure = jest.fn();
  }

  test('should throw an error when a parser has not been built yet', () => {
    const parserBuilder = new ParserBuilder();

    expect(() => parserBuilder.build()).toThrowError(
      `The parser has not been built yet. Please start from entrypoints: ${ParserBuilder.entrypoints.join(
        ','
      )}.`
    );
  });

  test('should throw an error if processors are added to an unbuilt parser', () => {
    const parserBuilder = new ParserBuilder();

    expect(() => parserBuilder.processors([new MockProcessor()])).toThrowError(
      `The parser has not been built yet. Please start from entrypoints: ${ParserBuilder.entrypoints.join(
        ','
      )}.`
    );
  });

  const containerStyle = {
    width: 600,
    height: 400,
    lineHeight: 24,
    computedFontFamily: 'Times New Roman',
    computedFontSize: '16px',
  };

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
        .processors([processor])
        .build()
    ).toBe(mockParser);

    expect(processor.configure).toHaveBeenCalledTimes(1);
  });
});

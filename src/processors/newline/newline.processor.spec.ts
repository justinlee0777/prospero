import Big from 'big.js';

import ParserState from '../../parsers/models/parser-state.interface';
import NewlineProcessor from './newline.processor';

describe('NewlineProcessor', () => {
  test('adds a newline only if there is none between paragraphs', () => {
    const processor = new NewlineProcessor();

    processor.configure({
      calculator: null as any,
      pageHeight: 36,
    });

    // Beginning of the book
    let parserState: ParserState = {
      pages: [],
      textIndex: 0,
      lines: [],
      pageHeight: Big(0),
      lineWidth: Big(0),
      lineHeight: Big(18),
      lineText: '',
    };

    expect(processor.process(parserState)).toEqual(parserState);

    // Has prior lines
    parserState = {
      ...parserState,
      textIndex: 3,
      lines: ['Foo'],
      pageHeight: Big(18),
    };

    expect(processor.process(parserState)).toEqual(parserState);

    // Line has words
    parserState = {
      ...parserState,
      textIndex: 6,
      lineText: 'Bar',
      lineWidth: Big(12),
    };

    expect(processor.process(parserState)).toEqual(parserState);

    // Last line has new line
    parserState = {
      ...parserState,
      textIndex: 4,
      lines: ['\n'],
    };

    expect(processor.process(parserState)).toEqual(parserState);

    // Last line has words, as well
    parserState = {
      ...parserState,
      textIndex: 7,
      lines: ['Foo\n'],
    };

    expect(processor.process(parserState)).toEqual(parserState);

    // And the proposed change will not cause an overflow, though the next line will
    parserState = {
      ...parserState,
      lineHeight: Big(12),
    };

    expect(processor.process(parserState)).toEqual({
      ...parserState,
      pages: ['Foo\n\n'],
      lines: [],
      pageHeight: Big(0),
    });

    // And the proposed change will not cause an overflow nor the next line
    parserState = {
      ...parserState,
      lineHeight: Big(6),
    };

    expect(processor.process(parserState)).toEqual({
      ...parserState,
      lines: ['Foo\n', '\n'],
      pageHeight: Big(24),
    });
  });
});

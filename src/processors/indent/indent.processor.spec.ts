import Big from 'big.js';

import ParserState from '../../parsers/models/parser-state.interface';
import TextChangeType from '../../parsers/models/text-change-type.enum';
import WordWidthCalculator from '../../word-width.calculator';
import IndentProcessor from './indent.processor';

describe('IndentProcessor', () => {
  const bookBeginning: ParserState = {
    pages: [],
    textIndex: 0,
    changes: [],
    bookLineHeight: Big(24),
    lines: [],
    pageChanges: [],
    lineWidth: Big(0),
    pageHeight: Big(0),
    lineHeight: Big(24),
    lineText: '',
  };

  const pageBeginning: ParserState = {
    pages: ['Foo\nBar\n'],
    textIndex: 7,
    changes: [{ values: [] }],
    bookLineHeight: Big(24),
    lines: [],
    pageChanges: [],
    lineWidth: Big(0),
    pageHeight: Big(0),
    lineHeight: Big(24),
    lineText: '',
  };

  const paragraphBeginning: ParserState = {
    pages: ['Foo\nBar\n'],
    textIndex: 11,
    changes: [{ values: [] }],
    bookLineHeight: Big(24),
    lines: ['Baz\n'],
    pageChanges: [],
    lineWidth: Big(0),
    pageHeight: Big(24),
    lineHeight: Big(24),
    lineText: '',
  };

  const inline: ParserState = {
    pages: [],
    textIndex: 3,
    changes: [],
    bookLineHeight: Big(24),
    lines: [],
    pageChanges: [],
    lineWidth: Big(0),
    pageHeight: Big(0),
    lineHeight: Big(24),
    lineText: 'Foo',
  };

  const calculator = new WordWidthCalculator('16px', 'Arial', 24);

  test('needs to be configured before starting processing', () => {
    const processor = new IndentProcessor(4);

    expect(() => processor.process(bookBeginning)).toThrowError(
      "Please run 'configure' with a proper calculator before processing."
    );
  });

  test("sets indentation for the book's beginning", () => {
    const processor = new IndentProcessor(4);

    processor.configure({ calculator });

    expect(processor.process(bookBeginning)).toEqual({
      bookLineHeight: Big(24),
      pages: [],
      textIndex: 4,
      lineHeight: Big(24),
      changes: [],
      lines: [],
      pageChanges: [
        {
          textIndex: 0,
          text: '    ',
          type: TextChangeType.ADD_WORD,
        },
      ],
      pageHeight: Big(0),
      lineWidth: Big(17.78125),
      lineText: '    ',
    });
  });

  test("sets indentation for the page's beginning", () => {
    const processor = new IndentProcessor(4);

    processor.configure({ calculator });

    expect(processor.process(pageBeginning)).toEqual({
      bookLineHeight: Big(24),
      pages: ['Foo\nBar\n'],
      textIndex: 11,
      lineHeight: Big(24),
      changes: [{ values: [] }],
      lines: [],
      pageChanges: [
        {
          textIndex: 7,
          text: '    ',
          type: TextChangeType.ADD_WORD,
        },
      ],
      pageHeight: Big(0),
      lineWidth: Big(17.78125),
      lineText: '    ',
    });
  });

  test("sets indentation for the paragraph's beginning", () => {
    const processor = new IndentProcessor(4);

    processor.configure({ calculator });

    expect(processor.process(paragraphBeginning)).toEqual({
      bookLineHeight: Big(24),
      pages: ['Foo\nBar\n'],
      textIndex: 15,
      lineHeight: Big(24),
      changes: [{ values: [] }],
      lines: ['Baz\n'],
      pageChanges: [
        {
          textIndex: 11,
          text: '    ',
          type: TextChangeType.ADD_WORD,
        },
      ],
      pageHeight: Big(24),
      lineWidth: Big(17.78125),
      lineText: '    ',
    });
  });

  test('does not set indentation', () => {
    const processor = new IndentProcessor(4);

    processor.configure({ calculator });

    expect(processor.process(inline)).toEqual(inline);
  });
});

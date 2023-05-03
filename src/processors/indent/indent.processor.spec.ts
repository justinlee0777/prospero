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
    lines: [],
    pageChanges: [],
    lineWidth: Big(0),
    line: 0,
    lineText: '',
  };

  const pageBeginning: ParserState = {
    pages: ['Foo\nBar\n'],
    textIndex: 7,
    changes: [{ values: [] }],
    lines: [],
    pageChanges: [],
    lineWidth: Big(0),
    line: 0,
    lineText: '',
  };

  const paragraphBeginning: ParserState = {
    pages: ['Foo\nBar\n'],
    textIndex: 11,
    changes: [{ values: [] }],
    lines: ['Baz\n'],
    pageChanges: [],
    lineWidth: Big(0),
    line: 1,
    lineText: '',
  };

  const inline: ParserState = {
    pages: [],
    textIndex: 3,
    changes: [],
    lines: [],
    pageChanges: [],
    lineWidth: Big(0),
    line: 0,
    lineText: 'Foo',
  };

  const calculator = new WordWidthCalculator('Arial', '16px');

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
      pages: [],
      textIndex: 4,
      changes: [],
      lines: [],
      pageChanges: [
        {
          textIndex: 0,
          text: '    ',
          type: TextChangeType.ADD_WORD,
        },
      ],
      lineWidth: Big(11.11328125),
      line: 0,
      lineText: '    ',
    });
  });

  test("sets indentation for the page's beginning", () => {
    const processor = new IndentProcessor(4);

    processor.configure({ calculator });

    expect(processor.process(pageBeginning)).toEqual({
      pages: ['Foo\nBar\n'],
      textIndex: 11,
      changes: [{ values: [] }],
      lines: [],
      pageChanges: [
        {
          textIndex: 7,
          text: '    ',
          type: TextChangeType.ADD_WORD,
        },
      ],
      lineWidth: Big(11.11328125),
      line: 0,
      lineText: '    ',
    });
  });

  test("sets indentation for the paragraph's beginning", () => {
    const processor = new IndentProcessor(4);

    processor.configure({ calculator });

    expect(processor.process(paragraphBeginning)).toEqual({
      pages: ['Foo\nBar\n'],
      textIndex: 15,
      changes: [{ values: [] }],
      lines: ['Baz\n'],
      pageChanges: [
        {
          textIndex: 11,
          text: '    ',
          type: TextChangeType.ADD_WORD,
        },
      ],
      lineWidth: Big(11.11328125),
      line: 1,
      lineText: '    ',
    });
  });

  test('does not set indentation', () => {
    const processor = new IndentProcessor(4);

    processor.configure({ calculator });

    expect(processor.process(inline)).toEqual(inline);
  });
});

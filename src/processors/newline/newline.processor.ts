import Big from 'big.js';

import ParserState from '../../parsers/models/parser-state.interface';
import TextChangeType from '../../parsers/models/text-change-type.enum';
import ProcessorConfig from '../models/processor.config';
import Processor from '../models/processor.interface';

/**
 * Add newlines between paragraphs if there are none.
 */
export default class NewlineProcessor implements Processor {
  private pageHeight: number;

  configure({ pageHeight }: ProcessorConfig): void {
    this.pageHeight = pageHeight;
  }

  process(parserState: ParserState): ParserState {
    const arePriorLines = parserState.lines.length > 0;
    const lineHasWords = parserState.lineText.length > 0;
    let lastLineHasNewLine = false;
    let lastLineHasWords = false;

    if (arePriorLines) {
      lastLineHasNewLine = parserState.lines.at(-1).at(-1) === '\n';
      lastLineHasWords = parserState.lines.at(-1) !== '\n';
    }

    const willNotOverflow = parserState.pageHeight
      .add(parserState.lineHeight)
      .lt(this.pageHeight);

    if (
      arePriorLines &&
      lineHasWords &&
      lastLineHasNewLine &&
      lastLineHasWords &&
      willNotOverflow
    ) {
      const newPageHeight = parserState.pageHeight.add(parserState.lineHeight);
      const nextLineWillOverflow = newPageHeight
        .add(parserState.lineHeight)
        .gte(this.pageHeight);

      if (nextLineWillOverflow) {
        return {
          ...parserState,
          pages: parserState.pages.concat(parserState.lines.join('') + '\n'),
          lines: [],
          pageHeight: Big(0),
          pageChanges: parserState.pageChanges.concat({
            textIndex: parserState.textIndex - parserState.lineText.length,
            text: '\n',
            type: TextChangeType.ADD_WORD,
          }),
        };
      } else {
        return {
          ...parserState,
          lines: parserState.lines.concat('\n'),
          pageHeight: parserState.pageHeight.add(parserState.lineHeight),
          pageChanges: parserState.pageChanges.concat({
            textIndex: parserState.textIndex - parserState.lineText.length,
            text: '\n',
            type: TextChangeType.ADD_WORD,
          }),
        };
      }
    } else {
      return parserState;
    }
  }
}

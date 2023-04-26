import Big from 'big.js';

import ParserState from '../../parsers/models/parser-state.interface';
import Word from '../../parsers/models/word.interface';
import ProcessorConfig from '../models/processor.config';
import Processor from '../models/processor.interface';
import TextChangeType from '../../parsers/models/text-change-type.enum';

export default class IndentProcessor implements Processor {
  private indent: Word;

  constructor(private spaces: number) {}

  configure({ calculator }: ProcessorConfig): void {
    const text = Array(this.spaces).fill(' ').join('');

    this.indent = {
      text,
      width: Big(calculator.calculate(text)),
    };
  }

  postprocess(parserState: ParserState): ParserState {
    let newlineFound: boolean;

    if (parserState.lineText.length > 0) {
      newlineFound = false;
    } else if (parserState.lines.length > 0) {
      newlineFound = parserState.lines.at(-1) === '\n';
    } else if (parserState.pages.length > 0) {
      newlineFound = parserState.pages.at(-1) === '\n';
    } else {
      newlineFound = true;
    }

    if (newlineFound) {
      return {
        ...parserState,
        pageChanges: parserState.pageChanges.concat({
          textIndex: parserState.textIndex,
          word: this.indent.text,
          type: TextChangeType.ADD_WORD,
        }),
        textIndex: parserState.textIndex + this.indent.text.length,
        lineWidth: this.indent.width,
        lineText: this.indent.text,
      };
    } else {
      return parserState;
    }
  }
}

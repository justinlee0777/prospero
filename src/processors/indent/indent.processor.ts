import Big from 'big.js';

import ParserState from '../../parsers/models/parser-state.interface';
import Word from '../../parsers/models/word.interface';
import ProcessorConfig from '../models/processor.config';
import Processor from '../models/processor.interface';
import TextChangeType from '../../parsers/models/text-change-type.enum';

/**
 * Add indentation to new paragraphs.
 */
export default class IndentProcessor implements Processor {
  private indent: Word;

  constructor(private spaces: number) {}

  /**
   * Calculates the size of the indentation in pixels.
   */
  configure({ calculator }: ProcessorConfig): void {
    const text = Array(this.spaces).fill(' ').join('');

    this.indent = {
      text,
      width: Big(calculator.calculate(text)),
    };
  }

  /**
   * @throws an error if the processor has not been configured with a proper calculator.
   */
  process(parserState: ParserState): ParserState {
    if (!this.indent) {
      throw new Error(
        "Please run 'configure' with a proper calculator before processing."
      );
    }

    let addIndentation: boolean;

    if (parserState.lineText.length > 0) {
      // If the current line already has text, then no indentation should be added.
      addIndentation = false;
    } else if (parserState.lines.length > 0) {
      /*
       * As the current line has no text,
       * If there are previous lines, check if the last character was a newline.
       */
      addIndentation = parserState.lines.at(-1).at(-1) === '\n';
    } else if (parserState.pages.length > 0) {
      /*
       * As the current line has no text,
       * and there are no previous lines (this is a new page),
       * check if the last character on the last page was a newline.
       */
      addIndentation = parserState.pages.at(-1).at(-1) === '\n';
    } else {
      /*
       * The current line has no text,
       * there are no previous lines,
       * there are not even previous pages,
       * so this is the beginning of the text. Add an indentation.
       */
      addIndentation = true;
    }

    if (addIndentation) {
      return {
        ...parserState,
        // Tell the parser the indentation was added.
        pageChanges: parserState.pageChanges.concat({
          textIndex: parserState.textIndex,
          text: this.indent.text,
          type: TextChangeType.ADD_WORD,
        }),
        textIndex: parserState.textIndex + this.indent.text.length,
        lineWidth: this.indent.width,
        // Set the indentation. No concat'ing here as this should be the start of the line.
        lineText: this.indent.text,
      };
    } else {
      return parserState;
    }
  }
}

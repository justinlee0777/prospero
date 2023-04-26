import ParserState from '../../parsers/models/parser-state.interface';
import ProcessorConfig from './processor.config';

/**
 * Processors decorate text.
 * Prospero by default only handles text. Processors can be used to analyze hints within the text itself to
 * enhance the text, so long as the hints do not change the text height or word widths.
 * Processors ought not be reused across multiple parsers. Please create a unique processor for each unique parser.
 */
export default interface Processor {
  /**
   * Allow the processor to access the parser's environment (ex. word width calculator).
   */
  configure?(config: ProcessorConfig): void;

  /**
   * Ran before pages are created. Used to remove hints from the text.
   * @param text is the text the user passes in.
   * @returns the text without decorations.
   */
  preprocess?(text: string): string;

  /**
   * Transform the current parser state.
   * Use the parser state to understand where in the process you are in. For example, HTMLProcessor caches
   * the previous parser state to know if new pages have been added, so that it has the entire context
   * before transforming text. Parser granularity is up to the processor.
   * @param parserState
   */
  process?(parserState: ParserState): ParserState;
}

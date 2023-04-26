import ParserState from '../../parsers/models/parser-state.interface';
import ProcessorConfig from './processor.config';

/**
 * Processors decorate text.
 * Prospero by default only handles text. Processors can be used to analyze hints within the text itself to
 * enhance the text, so long as the hints do not change the text height or word widths.
 * Processors cannot be reused across multiple parsers. Please create a unique processor for each unique parser.
 */
export default interface Processor {
  configure?(config: ProcessorConfig): void;

  /**
   * Ran before pages are created. Used to remove hints from the text.
   * @param text is the text the user passes in.
   * @returns the text without decorations.
   */
  preprocess?(text: string): string;

  /**
   */
  postprocess?(parserState: ParserState): ParserState;
}

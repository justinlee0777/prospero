import Word from './word.interface';

export default interface CreateTextParserConfig {
  textIndent: Word;
  /** The number of lines in a page. */
  pageLines: number;
  /** The width of the page, in pixels. */
  pageWidth: number;

  calculateWordWidth(word: string): number;
}

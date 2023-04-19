import Word from './word.interface';

export default interface CreateTextParserConfig {
  textIndent: Word;
  /** The number of lines in a page. */
  pageLines: number;
}

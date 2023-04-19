import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParseWord from '../models/parse-word.interface';
import createNewlineAtPageBeginningParser from './newline/newline-at-page-beginning.parser';
import createNewlineParser from './newline/newline.parser';
import parseWhitespaceAtPageBeginning from './whitespace/whitespace-at-page-beginning.parser';
import createWhitespaceAtTextOverflowParser from './whitespace/whitespace-at-text-overflow.parser';
import parseWhitespaceInline from './whitespace/whitespace-inline.parser';
import createWordAtTextOverflowParser from './word/word-at-text-overflow.parser';
import parseWord from './word/word.parser';

export class DefaultLinkBreakParser {
  parseNewlineAtPageBeginning: ParseWord;
  parseNewline: ParseWord;

  parseWhitespaceAtPageBeginning: ParseWord;
  parseWhitespaceAtTextOverflow: ParseWord;
  parseWhitespaceInline: ParseWord;

  parseWordAtTextOverflow: ParseWord;
  parseWord: ParseWord;

  constructor(config: CreateTextParserConfig) {
    this.parseNewlineAtPageBeginning =
      createNewlineAtPageBeginningParser(config);
    this.parseNewline = createNewlineParser(config);

    this.parseWhitespaceAtPageBeginning = parseWhitespaceAtPageBeginning;
    this.parseWhitespaceAtTextOverflow =
      createWhitespaceAtTextOverflowParser(config);
    this.parseWhitespaceInline = parseWhitespaceInline;

    this.parseWordAtTextOverflow = createWordAtTextOverflowParser(config);
    this.parseWord = parseWord;
  }
}

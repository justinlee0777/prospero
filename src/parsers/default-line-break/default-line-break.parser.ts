import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParseText from '../models/parse-text.interface';
import createNewlineAtPageBeginningParser from './newline/newline-at-page-beginning.parser';
import createNewlineParser from './newline/newline.parser';
import parseWhitespaceAtPageBeginning from './whitespace/whitespace-at-page-beginning.parser';
import createWhitespaceAtTextOverflowParser from './whitespace/whitespace-at-text-overflow.parser';
import parseWhitespaceInline from './whitespace/whitespace-inline.parser';
import parseWordAtTextOverflow from './word/word-at-text-overflow.parser';
import parseWord from './word/word.parser';

export class DefaultLinkBreakParser {
  parseNewlineAtPageBeginning: ParseText;
  parseNewline: ParseText;

  parseWhitespaceAtPageBeginning: ParseText;
  parseWhitespaceAtTextOverflow: ParseText;
  parseWhitespaceInline: ParseText;

  parseWordAtTextOverflow: ParseText;
  parseWord: ParseText;

  constructor(config: CreateTextParserConfig) {
    this.parseNewlineAtPageBeginning =
      createNewlineAtPageBeginningParser(config);
    this.parseNewline = createNewlineParser(config);

    this.parseWhitespaceAtPageBeginning = parseWhitespaceAtPageBeginning;
    this.parseWhitespaceAtTextOverflow =
      createWhitespaceAtTextOverflowParser(config);
    this.parseWhitespaceInline = parseWhitespaceInline;

    this.parseWordAtTextOverflow = parseWordAtTextOverflow;
    this.parseWord = parseWord;
  }
}

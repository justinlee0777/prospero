import DefaultLineBreakParser from './default-line-break/default-line-break.parser';
import CreateTextParserConfig from './models/create-text-parser-config.interface';
import Parser from './models/parser.interface';

export default class ParserFactory {
  static create(config: CreateTextParserConfig): Parser {
    return new DefaultLineBreakParser(config);
  }
}

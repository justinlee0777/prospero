import DefaultLineBreakParser from './default-line-break/default-line-break.parser';
import HTMLParser from './html/html.parser.server';
import CreateTextParserConfig from './models/create-text-parser-config.interface';
import Parser from './models/parser.interface';

export default class ParserFactory {
  static create(config: CreateTextParserConfig): Parser {
    return new DefaultLineBreakParser(config);
  }

  static createForHTML(config: CreateTextParserConfig): Parser {
    return new HTMLParser(config);
  }
}

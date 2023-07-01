import DefaultLineBreakParser from './default-line-break/default-line-break.parser';
import CreateTextParserConfig from './models/create-text-parser-config.interface';
import Parser from './models/parser.interface';
import IParserFactory from './parser-factory.interface';

export default function ParserFactory(
  HTMLParser: new (config: CreateTextParserConfig) => Parser
): IParserFactory {
  return class ParserFactory {
    static create(config: CreateTextParserConfig): Parser {
      return new DefaultLineBreakParser(config);
    }

    static createForHTML(config: CreateTextParserConfig): Parser {
      return new HTMLParser(config);
    }
  };
}

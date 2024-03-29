import HTMLTransformerOptions from '../transformers/html/html-transformer-options.interface';
import DefaultLineBreakParser from './default-line-break/default-line-break.parser';
import HTMLParserConstructor from './html/html-parser-constructor.interface';
import CreateTextParserConfig from './models/create-text-parser-config.interface';
import Parser from './models/parser.interface';
import IParserFactory from './parser-factory.interface';

export default function ParserFactory(
  HTMLParser: HTMLParserConstructor
): IParserFactory {
  return class ParserFactory {
    static create(config: CreateTextParserConfig): Parser {
      return new DefaultLineBreakParser(config);
    }

    static createForHTML(
      config: CreateTextParserConfig,
      options?: HTMLTransformerOptions
    ): Parser {
      return new HTMLParser(config, options);
    }
  };
}

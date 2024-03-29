import HTMLTransformerOptions from '../transformers/html/html-transformer-options.interface';
import CreateTextParserConfig from './models/create-text-parser-config.interface';
import Parser from './models/parser.interface';

export default interface IParserFactory {
  create(config: CreateTextParserConfig): Parser;

  createForHTML(
    config: CreateTextParserConfig,
    options?: HTMLTransformerOptions
  ): Parser;
}

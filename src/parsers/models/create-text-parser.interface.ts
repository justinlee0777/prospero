import CreateTextParserConfig from './create-text-parser-config.interface';
import ParseWord from './parse-word.interface';

export default interface CreateTextParser {
  (config: CreateTextParserConfig): ParseWord;
}

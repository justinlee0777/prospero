import CreateTextParserConfig from './create-text-parser-config.interface';
import ParseText from './parse-text.interface';

export default interface CreateTextParser {
  (config: CreateTextParserConfig): ParseText;
}

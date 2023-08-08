import CreateTextParserConfig from '../models/create-text-parser-config.interface';

export default interface CreateLineBreakParserConfig
  extends CreateTextParserConfig {
  /** Ignore newline characters. This is useful for certain HTML blocks. */
  ignoreNewline?: boolean;
}

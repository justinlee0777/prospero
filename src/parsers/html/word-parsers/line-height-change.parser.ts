import Big from 'big.js';

import BigUtils from '../../../utils/big';
import ChangeParserState from '../../models/change-parser-state.interface';
import CreateTextParserConfig from '../../models/create-text-parser-config.interface';
import ParserState from '../../models/parser.state';
import ParsePageOverflow from '../../word-parsers/page-overflow.parser';

/**
 * Change the line height of a parser state.
 */
export default class ChangeLineHeight implements ChangeParserState<number> {
  private parsePageOverflow: ChangeParserState<void>;

  constructor(private readonly config: CreateTextParserConfig) {
    this.parsePageOverflow = new ParsePageOverflow(config);
  }

  parse(state: ParserState, lineHeight: number): ParserState {
    state = state.change({
      lineHeight: BigUtils.max(Big(this.config.lineHeight), Big(lineHeight)),
    });

    return this.parsePageOverflow.parse(state);
  }
}

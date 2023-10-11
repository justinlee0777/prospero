import { formatVariables } from '../../utils/debug/format-variables.function';
import ParserStateObject from './parser-state-object.interface';

/**
 *
 */
export default class ParserState<
  InternalState extends ParserStateObject = ParserStateObject
> {
  private readonly workingCopy: InternalState;

  constructor(public readonly initial: InternalState) {
    this.workingCopy = { ...initial };
  }

  change(changes: Partial<InternalState>): this {
    return this.newInstance({
      ...this.workingCopy,
      ...changes,
    });
  }

  /**
   * Prints the parser state as a printable string.
   * @param omit are the properties to remove from the printable string; very useful for complex objects like arrays
   * @returns a string
   */
  print(omit: Array<string> = ['pages', 'lines']): string {
    const { workingCopy } = this;
    const printable = { ...workingCopy };

    for (const key of omit) {
      delete printable[key];
    }

    return formatVariables(printable);
  }

  private newInstance(initial: InternalState): this {
    const { constructor } = Object.getPrototypeOf(this);

    return new constructor(initial);
  }
}

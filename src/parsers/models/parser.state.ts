import ParserStateObject from './parser-state-object.interface';

/**
 *
 */
export default class ParserState<
  InternalState extends ParserStateObject = ParserStateObject
> {
  private readonly workingCopy: InternalState;

  constructor(public initial: InternalState) {
    this.workingCopy = { ...initial };
  }

  change(changes: Partial<InternalState>): this {
    return this.newInstance({
      ...this.workingCopy,
      ...changes,
    });
  }

  private newInstance(initial: InternalState): this {
    const { constructor } = Object.getPrototypeOf(this);

    return new constructor(initial);
  }
}

import Transformer from '../../transformers/models/transformer.interface';

export default interface Parser {
  /**
   * This is used to debug the parser. Beware if you use this directly. Or don't, I don't really care.
   */
  debug: {
    pageWidth: number;
  };

  setTransformers(transformers: Array<Transformer>): void;

  generatePages(text: string): Generator<string>;
}

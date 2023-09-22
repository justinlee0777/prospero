import HTMLTransformerOptions from '../../transformers/html/html-transformer-options.interface';
import Transformer from '../../transformers/models/transformer.interface';
import IWordWidthCalculator from '../../word-width-calculator.interface';
import CreateTextParserConfig from '../models/create-text-parser-config.interface';
import ParserGenerator from '../models/parser-generator.interface';
import ParserState from '../models/parser-state.interface';
import Parser from '../models/parser.interface';
import ParseEnd from '../word-parsers/end.parser';
import HTMLParserConstructor from './html-parser-constructor.interface';
import HTMLParserGenerator from './html.parser.generator';
import HTMLTokenizer from './html.tokenizer';

export default function HTMLParser(Tokenizer: {
  new (): HTMLTokenizer;
}): HTMLParserConstructor {
  return class HTMLParser implements Parser {
    /**
     * This is used to debug the parser. Beware if you use this directly.
     */
    public debug: CreateTextParserConfig;

    private readonly tokenizer = new Tokenizer();

    private calculator: IWordWidthCalculator;
    private transformers: Array<Transformer> = [];

    constructor(
      private config: CreateTextParserConfig,
      private transformerOptions?: HTMLTransformerOptions
    ) {
      this.debug = config;
    }

    setCalculator(calculator: IWordWidthCalculator): void {
      this.calculator = calculator;
    }

    setTransformers(transformers: Array<Transformer>): void {
      this.transformers = transformers;
    }

    createGenerator(text: string, initial?: ParserState): ParserGenerator {
      return new HTMLParserGenerator(
        text,
        this.tokenizer,
        this.config,
        this.calculator,
        this.transformers,
        this.transformerOptions,
        initial
      );
    }

    *generateParserStates(
      text: string,
      parserState?: ParserState,
      end = new ParseEnd()
    ): Generator<ParserState> {
      const generator = this.createGenerator(text, parserState);

      while (!generator.done) {
        yield (parserState = generator.next());
      }

      if (end) {
        yield end.parse(parserState);
      }
    }

    *generatePages(text: string): Generator<string> {
      const parserStates = this.generateParserStates(text);

      let parserState: ParserState;

      for (const newParserState of parserStates) {
        if (
          parserState &&
          newParserState.pages.length > parserState.pages.length
        ) {
          yield newParserState.pages.at(-1);
        }

        parserState = newParserState;
      }
    }
  };
}

import ContainerStyle from './container-style.interface';
import GetPage from './get-page.interface';
import ParserBuilder from './parsers/builders/parser.builder';
import Processor from './processors/models/processor.interface';

export default class Pages {
  private pageGenerator: Generator<string>;

  private cachedPages: Array<string> = [];
  private lastGeneratorResult: IteratorResult<string> | undefined;

  constructor(
    containerStyle: ContainerStyle,
    text: string,
    processors?: Array<Processor>
  ) {
    let parserBuilder = new ParserBuilder().fromContainerStyle(containerStyle);

    if (processors) {
      parserBuilder.processors(processors);
    }

    const parser = parserBuilder.build();

    this.pageGenerator = parser.generatePages(text);
  }

  get: GetPage = (pageNumber) => {
    const difference = pageNumber - (this.cachedPages.length - 1);

    if (difference < 0) {
      return this.cachedPages[pageNumber];
    } else if (this.lastGeneratorResult?.done) {
      return this.cachedPages[pageNumber] || null;
    } else {
      const newPages: Array<string> = [];
      let i = 0;

      while (i < difference) {
        this.lastGeneratorResult = this.pageGenerator.next();

        if (this.lastGeneratorResult.done) {
          break;
        } else {
          newPages.push(this.lastGeneratorResult.value);
          i++;
        }
      }

      this.cachedPages.push(...newPages);

      return this.cachedPages[pageNumber] || null;
    }
  };

  getAll(): Array<string> {
    return [...this.pageGenerator];
  }
}

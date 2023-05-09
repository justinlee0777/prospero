import ContainerStyle from './container-style.interface';
import GetPage from './get-page.interface';
import PagesOutput from './pages-output.interface';
import ParserBuilder from './parsers/builders/parser.builder';
import Processor from './processors/models/processor.interface';

export default class Pages {
  private pageGenerator: Generator<string>;

  private cachedPages: Array<string> = [];
  private lastGeneratorResult: IteratorResult<string> | undefined;

  constructor(
    private containerStyle: ContainerStyle,
    text: string,
    processors?: Array<Processor>,
    { fontLocation }: { fontLocation?: string } = {}
  ) {
    let parserBuilder = new ParserBuilder().fromContainerStyle(containerStyle);

    if (processors) {
      parserBuilder.setProcessors(processors);
    }

    if (fontLocation) {
      parserBuilder.setFontLocation(fontLocation);
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

  getContainerStyle(): ContainerStyle {
    return this.containerStyle;
  }

  getAll(): Array<string> {
    return [...this.pageGenerator];
  }

  /**
   * @returns a JS object that is compatable with the structured clone algorithm. This behavior will be unit tested.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
   */
  getData(): PagesOutput {
    return {
      pages: this.getAll(),
      containerStyles: this.containerStyle,
    };
  }
}

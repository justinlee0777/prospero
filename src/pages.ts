import ContainerStyle from './container-style.interface';
import GetPage from './get-page.interface';
import PagesAsIndicesOutput from './pages-as-indices-output.interface';
import PagesOutput from './pages-output.interface';
import IPages from './pages.interface';
import ParserBuilder from './parsers/builders/parser.builder';
import Processor from './processors/models/processor.interface';

export default class Pages implements IPages {
  private pageGenerator: Generator<string>;

  private cachedPages: Array<string> = [];
  private lastGeneratorResult: IteratorResult<string> | undefined;

  constructor(
    private containerStyle: ContainerStyle,
    text: string,
    processors?: Array<Processor>,
    { fontLocation, html }: { fontLocation?: string; html?: boolean } = {}
  ) {
    let parserBuilder = new ParserBuilder().fromContainerStyle(containerStyle);

    if (processors) {
      parserBuilder = parserBuilder.setProcessors(processors);
    }

    if (fontLocation) {
      parserBuilder = parserBuilder.setFontLocation(fontLocation);
    }

    if (html) {
      parserBuilder = parserBuilder.forHTML();
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

  getDataAsIndices(): PagesAsIndicesOutput {
    const stringPages = this.getAll();

    let text = '';
    let pages: PagesAsIndicesOutput['pages'] = [];

    let index = 0;

    stringPages.forEach((page) => {
      text += page;
      console.log(page);
      console.log('\n===================ENDING\n');
      pages.push({
        beginIndex: index,
        endIndex: (index += page.length),
      });
    });

    return {
      text,
      pages,
      containerStyles: this.containerStyle,
    };
  }
}

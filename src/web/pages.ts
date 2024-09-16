import {
  GetPage,
  IPages,
  PagesConfig,
  PagesOutput,
  PageStyles,
} from '../models';
import PagesAsIndicesOutput from '../models/pages-as-indices-output.interface';
import ParserBuilder from '../parsers/builders/parser.builder';
import Transformer from '../transformers/models/transformer.interface';

export default class Pages implements IPages {
  private pageGeneratorPromise: Promise<Generator<string>>;

  private cachedPages: Array<string> = [];
  private lastGeneratorResult: IteratorResult<string> | undefined;

  constructor(
    private pageStyles: PageStyles,
    text: string,
    transformers?: Array<Transformer>,
    { fontLocation }: PagesConfig = {}
  ) {
    let parserBuilder = new ParserBuilder().fromPageStyles(pageStyles);

    if (transformers) {
      parserBuilder = parserBuilder.setTransformers(transformers);
    }

    if (fontLocation) {
      parserBuilder = parserBuilder.setFontLocation(fontLocation);
    }

    this.pageGeneratorPromise = parserBuilder.build().then(parser => parser.generatePages(text));
  }

  get: GetPage = async (pageNumber) => {
    const difference = pageNumber - (this.cachedPages.length - 1);

    if (difference < 0) {
      return this.cachedPages[pageNumber];
    } else if (this.lastGeneratorResult?.done) {
      return this.cachedPages[pageNumber] || null;
    } else {
      const newPages: Array<string> = [];
      let i = 0;

      while (i < difference) {
        const pageGenerator = await this.pageGeneratorPromise;
        this.lastGeneratorResult = pageGenerator.next();

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

  async getPageStyles(): Promise<PageStyles> {
    return this.pageStyles;
  }

  async getAll(): Promise<Array<string>> {
    const pageGenerator = await this.pageGeneratorPromise;
    return [ ...pageGenerator ];
  }

  /**
   * @returns a JS object that is compatable with the structured clone algorithm. This behavior will be unit tested.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
   */
  async getData(): Promise<PagesOutput> {
    return {
      pages: await this.getAll(),
      pageStyles: this.pageStyles,
    };
  }

  async getDataAsIndices(): Promise<PagesAsIndicesOutput> {
    const stringPages = await this.getAll();

    let text = '';
    let pages: PagesAsIndicesOutput['pages'] = [];

    let index = 0;

    stringPages.forEach((page) => {
      text += page;
      pages.push({
        beginIndex: index,
        endIndex: (index += page.length),
      });
    });

    return {
      text,
      pages,
      pageStyles: this.pageStyles,
    };
  }
}

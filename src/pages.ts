import GetPage from './models/get-page.interface';
import PageStyles from './models/page-styles.interface';
import PagesAsIndicesOutput from './models/pages-as-indices-output.interface';
import PagesConfig from './models/pages-config.interface';
import PagesOutput from './models/pages-output.interface';
import IPages from './models/pages.interface';
import IParserBuilder from './parsers/builders/parser.builder.interface';
import HTMLTransformerOptions from './transformers/html/html-transformer-options.interface';
import Transformer from './transformers/models/transformer.interface';
import Constructor from './utils/constructor.type';

export default function Pages(ParserBuilder: {
  new (): IParserBuilder;
}): Constructor<
  IPages,
  [PageStyles, string, Array<Transformer>?, PagesConfig?]
> {
  return class Pages {
    private pageGenerator: Generator<string>;

    private cachedPages: Array<string> = [];
    private lastGeneratorResult: IteratorResult<string> | undefined;

    constructor(
      private pageStyles: PageStyles,
      text: string,
      transformers?: Array<Transformer>,
      { fontLocation, html }: PagesConfig = {}
    ) {
      let parserBuilder = new ParserBuilder().fromPageStyles(pageStyles);

      if (transformers) {
        parserBuilder = parserBuilder.setTransformers(transformers);
      }

      if (fontLocation) {
        parserBuilder = parserBuilder.setFontLocation(fontLocation);
      }

      if (html) {
        let option: HTMLTransformerOptions | undefined;

        if (typeof html === 'object') {
          option = html;
        }
        parserBuilder = parserBuilder.forHTML(option);
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

    getPageStyles(): PageStyles {
      return this.pageStyles;
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
        pageStyles: this.pageStyles,
      };
    }

    getDataAsIndices(): PagesAsIndicesOutput {
      const stringPages = this.getAll();

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
  };
}

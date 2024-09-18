import { chromium, Page } from 'playwright';
import { IPages, PagesConfig, PagesOutput, PageStyles } from '../models';
import PagesAsIndicesOutput from '../models/pages-as-indices-output.interface';
import Transformer from '../transformers/models/transformer.interface';
import WebPages from '../web/pages';

interface ServerPagesConfig extends PagesConfig {
  /**
   * Where the source code for Pages is hosted. The code is uploaded by Playwright and used to calculate
   * the pages in a way consistent with the web offering for Prospero.
   * You shouldn't have to define this as I'll host the source code somewhere.
   */
  webPagesSourceDomain: string;
}

const sourceCodeHost = 'https://www.iamjustinlee.com/source/prospero';

export default class Pages implements IPages {
  private webPagesSourceDomain: string;

  private webPagesSourceUrl: string;

  private webPagesConstructorParameters: ConstructorParameters<typeof WebPages>;

  constructor(
    pageStyles: PageStyles,
    text: string,
    transformers?: Array<Transformer>,
    {
      webPagesSourceDomain = sourceCodeHost,
      ...pageConfig
    }: ServerPagesConfig = {
      webPagesSourceDomain: sourceCodeHost,
    }
  ) {
    this.webPagesSourceDomain = webPagesSourceDomain;
    this.webPagesSourceUrl = `${this.webPagesSourceDomain}/web/pages.js`;

    text = transformers?.reduce(
      (acc, transformer) => transformer.transform(acc),
      text
    );
    this.webPagesConstructorParameters = [pageStyles, text, null, pageConfig];
  }

  async get(pageNumber: number): Promise<string> {
    const browserPage = await this.openBrowser();

    return browserPage.evaluate(
      async ({ sourceUrl, constructorParameters, pageNumber }) => {
        const module = await import(sourceUrl);

        const WebPagesClass = module.default;

        const webPages: WebPages = new WebPagesClass(...constructorParameters);

        return webPages.get(pageNumber);
      },
      {
        sourceUrl: this.webPagesSourceUrl,
        constructorParameters: this.webPagesConstructorParameters,
        pageNumber,
      }
    );
  }

  async getPageStyles(): Promise<PageStyles> {
    const browserPage = await this.openBrowser();

    return browserPage.evaluate(
      async ({ sourceUrl, constructorParameters }) => {
        const module = await import(sourceUrl);

        const WebPagesClass = module.default;

        const webPages: WebPages = new WebPagesClass(...constructorParameters);

        return webPages.getPageStyles();
      },
      {
        sourceUrl: this.webPagesSourceUrl,
        constructorParameters: this.webPagesConstructorParameters,
      }
    );
  }

  async getAll(): Promise<Array<string>> {
    const browserPage = await this.openBrowser();

    return browserPage.evaluate(
      async ({ sourceUrl, constructorParameters }) => {
        const module = await import(sourceUrl);

        const WebPagesClass = module.default;

        const webPages: WebPages = new WebPagesClass(...constructorParameters);

        return webPages.getAll();
      },
      {
        sourceUrl: this.webPagesSourceUrl,
        constructorParameters: this.webPagesConstructorParameters,
      }
    );
  }

  async getData(): Promise<PagesOutput> {
    const browserPage = await this.openBrowser();

    return browserPage.evaluate(
      async ({ sourceUrl, constructorParameters }) => {
        const module = await import(sourceUrl);

        const WebPagesClass = module.default;

        const webPages: WebPages = new WebPagesClass(...constructorParameters);

        const data = webPages.getData();

        return data;
      },
      {
        sourceUrl: this.webPagesSourceUrl,
        constructorParameters: this.webPagesConstructorParameters,
      }
    );
  }

  async getDataAsIndices(): Promise<PagesAsIndicesOutput> {
    const browserPage = await this.openBrowser();

    return browserPage.evaluate(
      async ({ sourceUrl, constructorParameters }) => {
        const module = await import(sourceUrl);

        const WebPagesClass = module.default;

        const webPages: WebPages = new WebPagesClass(...constructorParameters);

        return webPages.getDataAsIndices();
      },
      {
        sourceUrl: this.webPagesSourceUrl,
        constructorParameters: this.webPagesConstructorParameters,
      }
    );
  }

  private async openBrowser(): Promise<Page> {
    // TODO: Needs to be customizable instead of hardcoded to chromium
    const browser = await chromium.launch();

    const context = await browser.newContext();

    const page = await context.newPage();

    await page.goto(this.webPagesSourceDomain);

    return page;
  }
}

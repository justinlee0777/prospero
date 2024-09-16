import { chromium, Page } from 'playwright';
import { IPages, PagesConfig, PagesOutput, PageStyles } from '../models';
import PagesAsIndicesOutput from '../models/pages-as-indices-output.interface';
import Transformer from '../transformers/models/transformer.interface';
import WebPages from '../web/pages';

// Host source code on iamjustinlee.com and blah
export default class Pages
  implements Pick<IPages, 'getData' | 'getDataAsIndices'>
{
  private webPagesSourceDomain = 'http://localhost:8080';

  private webPagesSourceUrl = `${this.webPagesSourceDomain}/web/pages.js`;

  private webPagesConstructorParameters: ConstructorParameters<typeof WebPages>;

  constructor(
    pageStyles: PageStyles,
    text: string,
    transformers?: Array<Transformer>,
    pageConfig: PagesConfig = {}
  ) {
    text = transformers?.reduce(
      (acc, transformer) => transformer.transform(acc),
      text
    );
    this.webPagesConstructorParameters = [pageStyles, text, null, pageConfig];
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

import { chromium, Page } from 'playwright';
import sourceCodeUrl from '../consts/source-code-url';
import { IPages, PagesConfig, PagesOutput, PageStyles } from '../models';
import PagesAsIndicesOutput from '../models/pages-as-indices-output.interface';
import Transformer from '../transformers/models/transformer.interface';
import TransformerSerializer, {
  SerializedTransformer,
} from '../transformers/transformer.serializer';
import WebPages from '../web/pages';

interface ServerPagesConfig extends PagesConfig {
  /**
   * Where the source code for Pages is hosted. The code is uploaded by Playwright and used to calculate
   * the pages in a way consistent with the web offering for Prospero.
   * You shouldn't have to define this as I'll host the source code somewhere.
   */
  webPagesSourceDomain?: string;
}

export default class Pages implements IPages {
  private webPagesSourceDomain: string;

  private webPagesSourceUrl: string;

  private transformerSerializerSourceUrl: string;

  private webPagesConstructorParameters: ConstructorParameters<typeof WebPages>;

  private serializedTransformers: Array<SerializedTransformer>;

  constructor(
    pageStyles: PageStyles,
    text: string,
    transformers?: Array<Transformer>,
    {
      webPagesSourceDomain = sourceCodeUrl,
      ...pageConfig
    }: ServerPagesConfig = {
      webPagesSourceDomain: sourceCodeUrl,
    }
  ) {
    this.webPagesSourceDomain = webPagesSourceDomain;
    this.webPagesSourceUrl = `${this.webPagesSourceDomain}/web/pages.js`;
    this.transformerSerializerSourceUrl = `${this.webPagesSourceDomain}/transformers/transformer.serializer.js`;

    this.serializedTransformers = (transformers ?? []).map(
      TransformerSerializer.serialize
    );

    this.webPagesConstructorParameters = [pageStyles, text, null, pageConfig];
  }

  async get(pageNumber: number): Promise<string> {
    const browserPage = await this.openBrowser();

    return browserPage.evaluate(
      async ({
        sourceUrl,
        constructorParameters,
        pageNumber,
        serializedTransformers,
        serializerSourceUrl,
      }) => {
        const webPagesModule = await import(sourceUrl);

        const WebPagesClass = webPagesModule.default;

        const serializerModule = await import(serializerSourceUrl);

        const Serializer: typeof TransformerSerializer =
          serializerModule.default;

        const transformers = await Promise.all(
          serializedTransformers.map(Serializer.deserialize)
        );

        constructorParameters[2] = transformers;

        const webPages: WebPages = new WebPagesClass(...constructorParameters);

        return webPages.get(pageNumber);
      },
      {
        sourceUrl: this.webPagesSourceUrl,
        constructorParameters: this.webPagesConstructorParameters,
        pageNumber,
        serializedTransformers: this.serializedTransformers,
        serializerSourceUrl: this.transformerSerializerSourceUrl,
      }
    );
  }

  async getPageStyles(): Promise<PageStyles> {
    const browserPage = await this.openBrowser();

    return browserPage.evaluate(
      async ({
        sourceUrl,
        constructorParameters,
        serializedTransformers,
        serializerSourceUrl,
      }) => {
        const webPagesModule = await import(sourceUrl);

        const WebPagesClass = webPagesModule.default;

        const serializerModule = await import(serializerSourceUrl);

        const Serializer: typeof TransformerSerializer =
          serializerModule.default;

        const transformers = await Promise.all(
          serializedTransformers.map(Serializer.deserialize)
        );

        constructorParameters[2] = transformers;

        const webPages: WebPages = new WebPagesClass(...constructorParameters);

        return webPages.getPageStyles();
      },
      {
        sourceUrl: this.webPagesSourceUrl,
        constructorParameters: this.webPagesConstructorParameters,
        serializedTransformers: this.serializedTransformers,
        serializerSourceUrl: this.transformerSerializerSourceUrl,
      }
    );
  }

  async getAll(): Promise<Array<string>> {
    const browserPage = await this.openBrowser();

    return browserPage.evaluate(
      async ({
        sourceUrl,
        constructorParameters,
        serializedTransformers,
        serializerSourceUrl,
      }) => {
        const webPagesModule = await import(sourceUrl);

        const WebPagesClass = webPagesModule.default;

        const serializerModule = await import(serializerSourceUrl);

        const Serializer: typeof TransformerSerializer =
          serializerModule.default;

        const transformers = await Promise.all(
          serializedTransformers.map(Serializer.deserialize)
        );

        constructorParameters[2] = transformers;

        const webPages: WebPages = new WebPagesClass(...constructorParameters);

        return webPages.getAll();
      },
      {
        sourceUrl: this.webPagesSourceUrl,
        constructorParameters: this.webPagesConstructorParameters,
        serializedTransformers: this.serializedTransformers,
        serializerSourceUrl: this.transformerSerializerSourceUrl,
      }
    );
  }

  async getData(): Promise<PagesOutput> {
    const browserPage = await this.openBrowser();

    return browserPage.evaluate(
      async ({
        sourceUrl,
        constructorParameters,
        serializedTransformers,
        serializerSourceUrl,
      }) => {
        const webPagesModule = await import(sourceUrl);

        const WebPagesClass = webPagesModule.default;

        const serializerModule = await import(serializerSourceUrl);

        const Serializer: typeof TransformerSerializer =
          serializerModule.default;

        const transformers = await Promise.all(
          serializedTransformers.map(Serializer.deserialize)
        );

        constructorParameters[2] = transformers;

        const webPages: WebPages = new WebPagesClass(...constructorParameters);

        const data = webPages.getData();

        return data;
      },
      {
        sourceUrl: this.webPagesSourceUrl,
        constructorParameters: this.webPagesConstructorParameters,
        serializedTransformers: this.serializedTransformers,
        serializerSourceUrl: this.transformerSerializerSourceUrl,
      }
    );
  }

  async getDataAsIndices(): Promise<PagesAsIndicesOutput> {
    const browserPage = await this.openBrowser();

    return browserPage.evaluate(
      async ({
        sourceUrl,
        constructorParameters,
        serializedTransformers,
        serializerSourceUrl,
      }) => {
        const webPagesModule = await import(sourceUrl);

        const WebPagesClass = webPagesModule.default;

        const serializerModule = await import(serializerSourceUrl);

        const Serializer: typeof TransformerSerializer =
          serializerModule.default;

        const transformers = await Promise.all(
          serializedTransformers.map(Serializer.deserialize)
        );

        constructorParameters[2] = transformers;

        const webPages: WebPages = new WebPagesClass(...constructorParameters);

        return webPages.getDataAsIndices();
      },
      {
        sourceUrl: this.webPagesSourceUrl,
        constructorParameters: this.webPagesConstructorParameters,
        serializedTransformers: this.serializedTransformers,
        serializerSourceUrl: this.transformerSerializerSourceUrl,
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

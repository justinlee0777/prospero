import { readFile } from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

/**
 * Helps load the assets needed for the look-and-feel of a book.
 * There are utilities to load text from various sources and for loading fonts.
 */
export default class LoaderBuilder {
  private text: string;

  constructor(private sourceText: string) {
    this.text = sourceText;
  }

  static async fromWebHost(url: string): Promise<LoaderBuilder> {
    const response = await fetch(url);
    const text = await response.text();

    return new LoaderBuilder(text);
  }

  static async fromFile(filePath: string): Promise<LoaderBuilder> {
    const text = await new Promise<string>((resolve, reject) =>
      readFile(filePath, 'utf8', (err, file) =>
        err ? reject(err) : resolve(file)
      )
    );

    return new LoaderBuilder(text);
  }

  getSourceText(): string {
    return this.sourceText;
  }

  getText(): string {
    return this.text;
  }

  async asMarkdown(): Promise<LoaderBuilder> {
    const markdown = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(this.text);

    this.text = markdown.toString();

    return this;
  }
}

import { readFile } from 'fs';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export default async function getTextSample(): Promise<string> {
  const url = './text-samples/ulysses/proteus.txt';

  let text = await new Promise<string>((resolve, reject) =>
    readFile(url, 'utf8', (err, file) => (err ? reject(err) : resolve(file)))
  );

  if (url.includes('.md')) {
    const markdown = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(text);

    text = markdown.toString();
  }

  return text;
}

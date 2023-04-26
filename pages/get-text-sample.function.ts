import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export default async function getTextSample(): Promise<string> {
  const url = '../text-samples/markdown-test.md';

  const response = await fetch(url);
  const text = await response.text();

  if (url.includes('.md')) {
    const markdown = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(text);

    return markdown.toString();
  } else {
    return text;
  }
}

import { remark } from 'remark';
import html from 'remark-html';

export default async function getTextSample(): Promise<string> {
  const url = '../README.md';

  const response = await fetch(url);
  const text = await response.text();

  if (url.includes('.md')) {
    const markdown = await remark().use(html).process(text);

    return markdown.toString();
  } else {
    return text;
  }
}

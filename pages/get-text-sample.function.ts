import { LoaderBuilder } from '../src/loaders';

export default async function getTextSample(): Promise<string> {
  const url = '../text-samples/markdown-test.md';

  const builder = await LoaderBuilder.fromWebHost(url);

  if (url.includes('.md')) {
    await builder.asMarkdown();
  }

  return builder.getText();
}

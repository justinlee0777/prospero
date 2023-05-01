import { LoaderBuilder } from '../src/loaders';

export default async function getTextSample(): Promise<string> {
  const url = './text-samples/ping.txt';

  const builder = await LoaderBuilder.fromFile(url);

  if (url.includes('.md')) {
    await builder.asMarkdown();
  }

  return builder.getText();
}

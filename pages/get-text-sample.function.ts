import { LoaderBuilder } from '../src/loaders';

export default async function getTextSample(): Promise<string> {
  const url = '../text-samples/proteus.txt';

  const builder = await LoaderBuilder.fromWebHost(url);

  if (url.includes('.md')) {
    await builder.asMarkdown();
  }

  return builder.getText();
}

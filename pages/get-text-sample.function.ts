import { LoaderBuilder } from '../src/loaders/public-api';

export default async function getTextSample(): Promise<string> {
  const url = './text-samples/color-example.txt';

  const builder = await LoaderBuilder.fromFile(url);

  if (url.includes('.md')) {
    await builder.asMarkdown();
  }

  return builder.getText();
}

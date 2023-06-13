import { readFile } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { IndentTransformer, Pages } from '../../src/shared';
import ChapterWorkerData from './chapter-worker-data.interface';

export default async function workOnChapter({
  mobileStyles,
  desktopStyles,
  filename,
}: ChapterWorkerData) {
  const text = await new Promise<string>((resolve, reject) =>
    readFile(filename, 'utf8', (err, file) =>
      err ? reject(err) : resolve(file)
    )
  );

  const processors = [new IndentTransformer(5)];

  const fontLocation = join(cwd(), 'pages/Bookerly-Regular.ttf');

  const desktop = new Pages(desktopStyles, text, processors, {
    html: true,
    fontLocation,
  }).getDataAsIndices();

  const mobile = new Pages(mobileStyles, text, processors, {
    html: true,
    fontLocation,
  }).getDataAsIndices();

  return {
    mobile,
    desktop,
  };
}

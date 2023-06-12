import { readFile } from 'node:fs';

import { IndentProcessor, Pages } from '../../src/shared';
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

  const processors = [new IndentProcessor(5)];

  const desktop = new Pages(desktopStyles, text, processors, { html: true });

  const mobile = new Pages(mobileStyles, text, processors, { html: true });

  return {
    mobile: mobile.getDataAsIndices(),
    desktop: desktop.getDataAsIndices(),
  };
}

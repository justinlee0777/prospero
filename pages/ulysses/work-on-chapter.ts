import { readFile } from 'node:fs';

import Pages from '../../src/server/pages';
import {
  IndentTransformer,
  NewlineTransformer,
} from '../../src/transformers/public-api';
import TextToHTMLTransformer from '../../src/transformers/text-to-html/html.transformer';
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

  const processors = function () {
    return [
      new TextToHTMLTransformer(),
      new IndentTransformer(5),
      new NewlineTransformer({ beginningSections: 4, betweenParagraphs: 0 }),
    ];
  };

  const fontLocation = '/Bookerly/Bookerly-Regular.ttf';

  console.log(`working on ${filename}...`);

  const desktop = await new Pages(desktopStyles, text, processors(), {
    fontLocation,
  }).getDataAsIndices();

  const mobile = await new Pages(mobileStyles, text, processors(), {
    fontLocation,
  }).getDataAsIndices();

  console.log(`done with ${filename}`);

  return {
    mobile,
    desktop,
  };
}

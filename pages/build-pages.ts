import { writeFileSync } from 'fs';

import Pages from '../src/server/pages';
import containerStyles from './container-style.const';
import getTextSample from './get-text-sample.function';
import { pagesJsonLocation } from './pages-json-location.const';
import processors from './processors.const';

const text = await getTextSample();

const desktop = new Pages(
  { ...containerStyles, computedFontSize: '16px' },
  text,
  processors,
  { html: true }
);

const mobile = new Pages(
  { ...containerStyles, computedFontSize: '12px' },
  text,
  processors,
  { html: true }
);

writeFileSync(
  `./dist/${pagesJsonLocation}`,
  JSON.stringify({
    desktop: desktop.getData(),
    mobile: mobile.getData(),
  })
);

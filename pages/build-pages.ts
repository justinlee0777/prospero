import { writeFileSync } from 'fs';

import Pages from '../src/server/pages';
import containerStyles from './container-style.const';
import getTextSample from './get-text-sample.function';
import { pagesJsonLocation } from './pages-json-location.const';
import transformers from './transformers.const';

const text = await getTextSample();

const desktop = new Pages(
  { ...containerStyles, computedFontSize: '16px' },
  text,
  transformers,
  { html: false }
);

const mobile = new Pages(
  { ...containerStyles, computedFontSize: '12px' },
  text,
  transformers,
  { html: false }
);

writeFileSync(
  `./dist/${pagesJsonLocation}`,
  JSON.stringify({
    desktop: desktop.getData(),
    mobile: mobile.getData(),
  })
);

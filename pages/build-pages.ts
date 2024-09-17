import { writeFileSync } from 'fs';

import Pages from '../src/server/pages';
import containerStyles from './container-style.const';
import getTextSample from './get-text-sample.function';
import { pagesJsonLocation } from './pages-json-location.const';
import transformers from './transformers.const';

const text = await getTextSample();

const desktop = new Pages(
  'http://localhost:9292/prospero',
  { ...containerStyles, computedFontSize: '16px' },
  text,
  transformers
);

const mobile = new Pages(
  'http://localhost:9292/prospero',
  { ...containerStyles, computedFontSize: '12px' },
  text,
  transformers
);

const desktopData = await desktop.getData();

const mobileData = await mobile.getData();

writeFileSync(
  `./dev/${pagesJsonLocation}`,
  JSON.stringify({
    desktop: desktopData,
    mobile: mobileData,
  })
);

process.exit(0);

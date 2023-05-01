import { writeFileSync } from 'fs';
import path from 'path';

import containerStyles from './container-style.const';
import getTextSample from './get-text-sample.function';
import processors from './processors.const';
import { Pages } from '../src';
import { pagesJsonLocation } from './pages-json-location.const';

const text = await getTextSample();

const pages = new Pages(containerStyles, text, processors);

writeFileSync(
  path.join(__dirname, pagesJsonLocation),
  JSON.stringify(pages.getData())
);

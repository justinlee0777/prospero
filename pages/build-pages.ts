import { writeFileSync } from 'fs';
import path from 'path';

import { PagesBuilder } from '../src/server';
import containerStyles from './container-style.const';
import getTextSample from './get-text-sample.function';
import { pagesJsonLocation } from './pages-json-location.const';
import processors from './processors.const';

const text = await getTextSample();

const pagesBuilder = new PagesBuilder()
  // .setFont(containerStyles.computedFontSize, containerStyles.computedFontFamily)
  .setLineHeight(containerStyles.lineHeight)
  .setMargin(containerStyles.margin)
  .setPadding(containerStyles.padding)
  .setBorder(containerStyles.border)
  .setText(text)
  .setProcessors(processors)
  .addSize(375, 667);

const [desktop] = pagesBuilder
  .setFont('16px', containerStyles.computedFontFamily)
  .build();

const [mobile] = pagesBuilder
  .setFont('12px', containerStyles.computedFontFamily)
  .build();

// const pages = new Pages(containerStyles, text, processors);

writeFileSync(
  path.join(__dirname, pagesJsonLocation),
  JSON.stringify({
    desktop: desktop.getData(),
    mobile: mobile.getData(),
  })
);

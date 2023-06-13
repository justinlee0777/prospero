import PagesBuilder from '../src/pages.builder';
import containerStyles from './container-style.const';
import getTextSample from './get-text-sample.function';
import processors from './processors.const';

const text = await getTextSample();

const pagesBuilder = new PagesBuilder()
  // .setFont(containerStyles.computedFontSize, containerStyles.computedFontFamily)
  .setLineHeight(containerStyles.lineHeight)
  .setMargin(containerStyles.margin)
  .setPadding(containerStyles.padding)
  .setBorder(containerStyles.border)
  .setText(text)
  .setTransformers(processors)
  .addSize(375, 667);

const [desktop] = pagesBuilder
  .setFont('16px', containerStyles.computedFontFamily)
  .build({ html: true });

const [mobile] = pagesBuilder
  .setFont('12px', containerStyles.computedFontFamily)
  .build({ html: true });

const url = 'http://0.0.0.0:9292';

try {
  let response = await fetch(`${url}/prospero/texts/ulysses/mobile`, {
    method: 'PUT',
    body: JSON.stringify(mobile.getDataAsIndices()),
  });

  console.log(response.status);

  response = await fetch(`${url}/prospero/texts/ulysses/desktop`, {
    method: 'PUT',
    body: JSON.stringify(desktop.getDataAsIndices()),
  });

  console.log(response.status);
} catch (error) {
  console.log(error);
}

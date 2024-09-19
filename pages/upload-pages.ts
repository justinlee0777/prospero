import Pages from '../src/server/pages';
import containerStyles from './container-style.const';
import getTextSample from './get-text-sample.function';
import transformers from './transformers.const';

const text = await getTextSample();

const desktop = new Pages(
  { ...containerStyles, computedFontSize: '16px' },
  text,
  transformers
);

const mobile = new Pages(
  { ...containerStyles, computedFontSize: '12px' },
  text,
  transformers
);

const url = 'https://iamjustinlee.com/api';

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

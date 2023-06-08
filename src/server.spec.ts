jest.mock('unified', () => {
  let unifiedReturnValue = {};

  unifiedReturnValue['use'] = jest.fn().mockReturnValue(unifiedReturnValue);
  unifiedReturnValue['process'] = jest.fn().mockImplementation((text) => text);

  return {
    unified: () => unifiedReturnValue,
  };
});

jest.mock('rehype-stringify', () => jest.fn());
jest.mock('remark-gfm', () => jest.fn());
jest.mock('remark-parse', () => jest.fn());
jest.mock('remark-rehype', () => jest.fn());

jest.mock('lodash-es', () => ({
  cloneDeep: jest.fn().mockImplementation((arg) => arg),
}));

import path from 'path';
import { cwd } from 'process';
import { IndentProcessor, LoaderBuilder, PagesBuilder } from './server';

/*
 * Contract testing.
 */
describe('server entrypoint', () => {
  test.only('runs basic path', async () => {
    let builder = await LoaderBuilder.fromFile(
      path.join(cwd(), './text-samples/ping.txt')
    );
    builder = await builder.asMarkdown();

    const text = builder.getText();

    const [pages] = new PagesBuilder()
      .setFont('16px', 'Arial')
      .setLineHeight(24)
      .setText(text)
      .setProcessors([new IndentProcessor(5)])
      .addSize(375, 667)
      .build();

    expect(pages).toBeTruthy();
    expect('get' in pages).toBe(true);
    expect('getAll' in pages).toBe(true);
    expect('getData' in pages).toBe(true);
  });
});

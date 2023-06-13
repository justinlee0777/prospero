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

import { readFile } from 'fs';
import path from 'path';
import { cwd } from 'process';

import { IndentTransformer, Pages } from './server';

/*
 * Contract testing.
 */
describe('server entrypoint', () => {
  test.only('runs basic path', async () => {
    const text = await new Promise<string>((resolve, reject) =>
      readFile(
        path.join(cwd(), './text-samples/ping.txt'),
        'utf8',
        (err, file) => (err ? reject(err) : resolve(file))
      )
    );

    const pages = new Pages(
      {
        computedFontFamily: 'Arial',
        computedFontSize: '16px',
        lineHeight: 24,
        width: 375,
        height: 667,
      },
      text,
      [new IndentTransformer(5)]
    );

    expect(pages).toBeTruthy();
    expect('get' in pages).toBe(true);
    expect('getAll' in pages).toBe(true);
    expect('getData' in pages).toBe(true);
  });
});

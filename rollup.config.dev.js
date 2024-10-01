import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { copyFileSync, cpSync, readdirSync } from 'fs';
import postcss from 'rollup-plugin-postcss';

const sourcemap = true;

const dir = 'dev';

const pageEntries = readdirSync('./pages')
  .filter((filename) => filename.includes('-page.ts'))
  .map((filename) => {
    const tokens = filename.split('.');

    return {
      extensionlessName: tokens.slice(0, -1),
      extension: tokens.at(-1),
    };
  });

cpSync('text-samples', dir, { recursive: true });

copyFileSync('pages/Bookerly-Regular.ttf', `${dir}/Bookerly-Regular.ttf`);

cpSync('pages/Bookerly', dir, { recursive: true });

export default [
  // HTML
  ...pageEntries.map(({ extensionlessName, extension }) => ({
    input: `pages/${extensionlessName}.${extension}`,
    output: {
      sourcemap,
      file: `${dir}/${extensionlessName}.js`,
    },
    plugins: [
      nodeResolve({
        moduleDirectories: ['node_modules'],
      }),
      commonjs(),
      typescript(),
      postcss({
        extract: true,
      }),
      html({
        fileName: `${extensionlessName}.html`,
      }),
    ],
  })),
];

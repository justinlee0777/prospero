import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';

const commonPlugins = [
  nodeResolve({
    moduleDirectories: ['node_modules'],
  }),
  commonjs({
    dynamicRequireTargets: ['node_modules/jsdom/**/xhr-sync-worker.js'],
  }),
  json(),
  typescript({
    tsconfig: 'tsconfig.prod.json',
  }),
];

const dir = 'dist';
const format = 'esm';

const output = {
  dir,
  format,
};

export default [
  // Base build
  {
    input: {
      'server/pages': 'src/pages-server.ts',
      'server/server-pages': 'src/server-pages.ts',
      'server/transformers': 'src/transformers/public-api.ts',
      server: 'src/server.ts',
    },
    output: {
      ...output,
      preserveModules: true,
    },
    plugins: [...commonPlugins],
    external: ['canvas', 'jsdom'],
  },
  // Web build
  {
    input: {
      // UI Components
      'web/book': 'src/components/book/book.component.ts',
      'web/books': 'src/components/books/books.component.ts',
      'web/flexible-book':
        'src/components/flexible-book/flexible-book.component.ts',
      'web/animations': 'src/components/book/animations/public-api.ts',
      'web/theming': 'src/components/book/theming/public-api.ts',
      'web/listeners': 'src/components/listeners/public-api.ts',
      // Web utils
      'web/pages': 'src/pages-web.ts',
      'web/server-pages': 'src/server-pages.ts',
      'web/transformers': 'src/transformers/public-api.ts',
      // Barrel
      web: 'src/web.ts',
    },
    output: {
      ...output,
      preserveModules: true,
    },
    plugins: [
      replace({
        'html.sanitizer': 'html.sanitizer.web',
      }),
      ...commonPlugins,
      postcss({
        modules: true,
      }),
    ],
  },
  // React build
  {
    input: 'src/react/index.ts',
    output: {
      format,
      file: `${dir}/web/react.js`,
    },
    plugins: [...commonPlugins],
    external: ['react'],
  },
];

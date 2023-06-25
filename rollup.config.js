import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { copyFileSync, mkdirSync, readFileSync } from 'fs';
import postcss from 'rollup-plugin-postcss';

const commonPlugins = [
  commonjs(),
  nodeResolve({
    moduleDirectories: ['node_modules'],
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

const pkg = JSON.parse(readFileSync('./package.json', { encoding: 'utf-8' }));

const externalPackages = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

// Creating regexes of the packages to make sure subpaths of the
// packages are also treated as external
const external = externalPackages.map(
  (packageName) => new RegExp(`^${packageName}(\/.*)?`)
);

mkdirSync(dir);
copyFileSync('package.json', `${dir}/package.json`);
copyFileSync('LICENSE', `${dir}/LICENSE`);

export default [
  // Base build
  {
    input: {
      'server/pages': 'src/server/pages.ts',
      'server/server-pages': 'src/server-pages.ts',
      'server/transformers': 'src/transformers/public-api.ts',
      server: 'src/server.ts',
    },
    output: {
      ...output,
      preserveModules: true,
    },
    plugins: [...commonPlugins],
    external,
  },
  // Web build
  {
    input: {
      // UI Components
      'web/book': 'src/web/book/index.ts',
      'web/books': 'src/web/books/index.ts',
      'web/flexible-book': 'src/web/flexible-book/index.ts',
      'web/book/animations': 'src/web/book/animations/index.ts',
      'web/book/theming': 'src/web/book/theming/index.ts',
      'web/book/listeners': 'src/web/book/listeners/index.ts',
      // Web utils
      'web/pages': 'src/web/pages.ts',
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
      ...commonPlugins,
      postcss({
        modules: {
          generateScopedName: 'prospero__[local]',
        },
        inject: (cssVariableName) =>
          `import styleInject from 'style-inject';\nstyleInject(${cssVariableName});`,
      }),
    ],
    external,
  },
  // React build
  {
    input: 'src/react/index.ts',
    output: {
      format,
      file: `${dir}/web/react.js`,
    },
    plugins: [...commonPlugins],
    external,
  },
];

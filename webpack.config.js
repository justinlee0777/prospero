const fs = require('fs');
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Shared configurations across environments
const moduleRules = [
  {
    test: /\.ts$/,
    exclude: /node_modules/,
    use: {
      loader: 'ts-loader',
      options: {},
    },
  },
  {
    test: /\.css$/i,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          modules: true,
        },
      },
    ],
  },
];

const resolvedExtensions = ['.ts', '.js'];

const plugins = [new MiniCssExtractPlugin()];

// Loading pages for development environment
const extensionlessFilenames = fs
  .readdirSync('./pages')
  .filter((filename) => filename.includes('.ts'))
  .map((filename) => filename.slice(0, filename.length - 3));

const pageEntry = extensionlessFilenames.reduce((entry, filename) => {
  return {
    ...entry,
    [filename]: `./pages/${filename}.ts`,
  };
}, {});

const pageHtml = extensionlessFilenames.map((filename) => {
  return new HtmlWebpackPlugin({
    filename: `${filename}.html`,
    chunks: [filename],
  });
});

const productionModuleRules = moduleRules.map((rule) => {
  if (rule.use.loader === 'ts-loader') {
    rule = structuredClone(rule);
    rule.use.options.configFile = 'tsconfig.prod.json';
  }

  return rule;
});

const productionConfig = {
  mode: 'production',
  output: {
    filename: '[name].js',
    library: {
      type: 'commonjs-module',
    },
  },
  module: {
    rules: productionModuleRules,
  },
  resolve: {
    extensions: resolvedExtensions,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: ['package.json'],
    }),
    ...plugins,
  ],
};

module.exports = [
  {
    ...productionConfig,
    name: 'production-web',
    entry: {
      components: './src/components/index.ts',
    },
    target: 'web',
  },
  {
    ...productionConfig,
    name: 'production-server',
    entry: {
      loaders: './src/loaders/index.ts',
      index: './src/index.ts',
      processors: './src/processors/index.ts',
    },
    module: {
      rules: [
        {
          test: /\.node$/,
          loader: 'node-loader',
        },
        ...productionModuleRules,
      ],
    },
    target: 'node',
    externals: {
      canvas: 'canvas',
    },
  },
  {
    name: 'development',
    mode: 'development',
    optimization: {
      minimize: false,
    },
    devtool: 'source-map',
    stats: 'verbose',
    entry: {
      ...pageEntry,
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name].bundle.js',
    },
    module: {
      rules: [
        ...moduleRules,
        {
          test: /\.html$/i,
          loader: 'html-loader',
        },
      ],
    },
    resolve: {
      extensions: resolvedExtensions,
    },
    plugins: [
      ...pageHtml,
      new HtmlWebpackPlugin({
        filename: 'index.html',
        chunks: [],
        templateContent: () => {
          const links = extensionlessFilenames.map(
            (filename) => `<a href="/${filename}">${filename}</a>`
          );

          return `
          <html>
            <body>
             ${links.join('<br/>')}
            </body>
          </html>
        `;
        },
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: './text-samples',
            to: 'text-samples',
          },
          'README.md',
        ],
      }),
      ...plugins,
    ],
  },
  {},
];

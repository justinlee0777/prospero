const fs = require('fs');
const path = require('path');
const { cwd } = require('process');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Loading pages for development environment
const extensionlessFilenames = [];
const pageEntry = {};

fs.readdirSync('./pages')
  .filter((filename) => filename.includes('-page.ts'))
  .forEach((filename) => {
    const extensionlessFilename = filename.split('.').at(0);

    extensionlessFilenames.push(extensionlessFilename);
    pageEntry[extensionlessFilename] = `./pages/${filename}`;
  });

const pageHtml = extensionlessFilenames.map((filename) => {
  return new HtmlWebpackPlugin({
    filename: `${filename}.html`,
    chunks: [filename],
  });
});

module.exports = {
  name: 'development-web',
  mode: 'development',
  optimization: {
    minimize: false,
  },
  devtool: 'source-map',
  stats: 'verbose',
  experiments: {
    topLevelAwait: true,
  },
  entry: {
    ...pageEntry,
  },
  output: {
    path: path.resolve(cwd(), './dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
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
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /src\/sanitizers\/html\/html\.sanitizer\.ts/,
      path.join(__dirname, '../../src/sanitizers/html/html.sanitizer.web.ts')
    ),
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
    new MiniCssExtractPlugin(),
  ],
};

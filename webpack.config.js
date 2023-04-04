const fs = require('fs');
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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

module.exports = {
  entry: {
    ...pageEntry,
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
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
        use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
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
      ],
    }),
    new MiniCssExtractPlugin(),
  ],
};

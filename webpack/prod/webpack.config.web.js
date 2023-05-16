const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { join } = require('path');
const webpack = require('webpack');

module.exports = {
  name: 'production-web',
  mode: 'production',
  entry: {
    web: ['./src/web.ts'],
  },
  output: {
    filename: '[name].js',
    library: {
      type: 'commonjs-module',
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.prod.json',
          },
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
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /src\/sanitizers\/html\/html\.sanitizer\.ts/,
      join(__dirname, '../../src/sanitizers/html/html.sanitizer.web.ts')
    ),
    new MiniCssExtractPlugin(),
  ],
  target: 'web',
};

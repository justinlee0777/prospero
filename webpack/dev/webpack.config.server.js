const path = require('path');
const { cwd } = require('process');
const webpack = require('webpack');

module.exports = {
  name: 'development-server',
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
    buildPages: path.resolve(cwd(), './pages/build-pages.ts'),
    uploadPages: path.resolve(cwd(), './pages/upload-pages.ts'),
    'upload-ulysses': path.resolve(cwd(), './pages/ulysses/upload.ts'),
  },
  output: {
    path: path.resolve(cwd(), './dist'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {},
        },
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};

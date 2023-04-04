const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: {
    'character-widths': './pages/character-widths.ts',
    'get-text-content': './pages/get-text-content.ts',
    'normalize-page-height': './pages/normalize-page-height.ts',
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
    new HtmlWebpackPlugin({
      filename: 'character-widths.html',
      chunks: ['character-widths'],
    }),
    new HtmlWebpackPlugin({
      filename: 'get-text-content.html',
      chunks: ['get-text-content'],
    }),
    new HtmlWebpackPlugin({
      filename: 'normalize-page-height.html',
      chunks: ['normalize-page-height'],
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

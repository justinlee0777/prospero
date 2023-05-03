const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
  plugins: [new MiniCssExtractPlugin()],
  target: 'web',
};

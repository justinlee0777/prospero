const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  name: 'production',
  mode: 'production',
  entry: {
    types: './src/types.ts',
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
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: ['package.json'],
    }),
  ],
};

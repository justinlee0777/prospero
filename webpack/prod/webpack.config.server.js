const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  name: 'production-server',
  mode: 'production',
  entry: {
    server: './src/server.ts',
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
        test: /\.node$/,
        loader: 'node-loader',
      },
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
  target: 'node',
  externals: {
    canvas: 'canvas',
  },
};

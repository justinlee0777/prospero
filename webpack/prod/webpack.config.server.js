module.exports = {
  name: 'production-server',
  mode: 'production',
  entry: {
    pages: './src/pages.ts',
    'server-pages': './src/server-pages.ts',
    transformers: './src/transformers/public-api.ts',
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
  target: 'node',
  externals: {
    canvas: 'canvas',
  },
};

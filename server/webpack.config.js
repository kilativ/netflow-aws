const path = require('path');
const nodeExternals = require('webpack-node-externals');
const {
  NODE_ENV = 'production',
} = process.env;

module.exports = {
  entry: './src/server.ts',
  mode: NODE_ENV,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'server.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  node: {
    __dirname: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'ts-loader',
        ]
      }
    ]
  },
  externals: [ nodeExternals() ]
}
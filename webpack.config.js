const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index.js',
    library: 'apollo-accounts-server',
    libraryTarget: 'umd',
  },
  modulesDirectories: [
    'src',
    'node_modules',
  ],
  module: {
    loaders: [{
      test: /\.css/,
      loader: 'style!css',
    }, {
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
    }, {
      test: /\.json$/,
      loader: 'json',
    }],
  },
};

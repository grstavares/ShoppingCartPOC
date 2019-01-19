const path = require('path');

module.exports = {
  mode: "production",
  target: 'node',
  entry: ['./src/index.ts'],
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  externals: {
    'aws-sdk': 'aws-sdk'
  },
  output: {
    filename: 'index.js',
    library: "index",
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    minimize: false
  }
};
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: './app/initialize.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        loader: 'webpack-glsl-loader'
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [{
            loader: "css-loader"
          }, {
            loader: "sass-loader"
          }]
        })
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'app/assets', to: '.' }]),
    new ExtractTextPlugin('app.css')
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    modules: ['node_modules', 'app'],
    extensions: ['.js', '.json', '.glsl']
  },
  devServer: {
    contentBase: './dist/',
    port: 3333
  },
};

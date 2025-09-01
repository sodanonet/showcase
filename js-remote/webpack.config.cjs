const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin, DefinePlugin } = require('webpack').container;
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  
  devServer: {
    port: 3006,
    host: 'localhost',
    hot: true,
    compress: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
  
  resolve: {
    extensions: ['.js', '.json'],
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions', 'not dead'],
                  ie: '11'
                },
                modules: false
              }]
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  
  plugins: [
    new webpack.DefinePlugin({
      'import.meta': 'undefined',
      'import.meta.url': '"/"',
    }),
    
    new ModuleFederationPlugin({
      name: 'js_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './JSModules': './src/index.js',
      },
      shared: {},
    }),
    
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'JavaScript Remote - Modern ES2022 Features'
    }),
  ],
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: '/',
  },
  
  target: ['web', 'es5'],
  
  node: {
    __dirname: false,
    __filename: false,
  },
  
  optimization: {
    moduleIds: 'named',
    chunkIds: 'named',
  },
};
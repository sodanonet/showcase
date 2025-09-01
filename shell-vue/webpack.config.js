const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  
  devServer: {
    port: 3000,
    host: 'localhost',
    hot: true,
    compress: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
    fallback: {
      "events": require.resolve("events/"),
      "util": require.resolve("util/"),
      "buffer": require.resolve("buffer/"),
      "process": require.resolve("process/browser"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "querystring": require.resolve("querystring-es3"),
      "crypto": require.resolve("crypto-browserify"),
      "fs": false,
      "os": require.resolve("os-browserify/browser"),
      "url": require.resolve("url/")
    }
  },
  
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['last 2 versions', 'not dead']
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
    new VueLoaderPlugin(),
    
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    
    new ModuleFederationPlugin({
      name: 'shell_vue',
      remotes: {
        react_remote: 'react_remote@http://localhost:3001/remoteEntry.js',
        vue_remote: 'vue_remote@http://localhost:3002/remoteEntry.js',
        angular_remote: 'angular_remote@http://localhost:3004/remoteEntry.js',
        ts_remote: 'ts_remote@http://localhost:3005/remoteEntry.js',
        js_remote: 'js_remote@http://localhost:3006/remoteEntry.js',
      },
      shared: {
        vue: {
          singleton: true,
          eager: true,
          requiredVersion: '^3.4.0'
        }
      },
    }),
    
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Micro-Frontend Shell - Vue.js Host Application'
    }),
  ],
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: 'auto',
  },
  
  target: 'web',
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        remotes: {
          test: /[\\/]webpack[\\/]container[\\/]/,
          name: 'remotes',
          chunks: 'all',
        },
      },
    },
  },
};
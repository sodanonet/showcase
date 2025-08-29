const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { VueLoaderPlugin } = require('vue-loader');

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
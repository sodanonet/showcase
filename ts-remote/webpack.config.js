const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  
  devServer: {
    port: 3005,
    host: 'localhost',
    hot: true,
    compress: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
  
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    extensionAlias: {
      '.js': ['.js', '.ts'],
      '.mjs': ['.mjs', '.mts'],
    },
  },
  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json',
            transpileOnly: false,
            compilerOptions: {
              module: 'es2020',
              target: 'es2020',
            }
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  
  plugins: [
    new ModuleFederationPlugin({
      name: 'ts_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './WebComponents': './src/index.ts',
      },
      shared: {},
    }),
    
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'TypeScript Remote with Web Components'
    }),
  ],
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: '/',
  },
  
  target: ['web', 'es2020'],
  
  experiments: {
    outputModule: false,
  },
};
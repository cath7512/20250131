const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(true)
      })
    ],
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              sourceType: 'module',
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      fallback: {
        path: false,
        fs: false
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('js')
      .use('babel-loader')
      .loader('babel-loader')
      .tap(options => ({
        ...options,
        sourceType: 'module'
      }));
  }
});

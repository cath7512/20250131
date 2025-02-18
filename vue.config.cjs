const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(true)
      })
    ],
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'assets/country_flags/[name].[ext]'
              }
            }
          ]
        }
      ]
    }
  },
  productionSourceMap: true, // 프로덕션 모드에서도 소스 맵을 생성하려면 true로 설정
  lintOnSave: false  
});

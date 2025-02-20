import { defineConfig } from '@vue/cli-service'
import webpack from 'webpack'

export default defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        "path": false,
        "fs": false
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_OPTIONS_API__': JSON.stringify(true),
        '__VUE_PROD_DEVTOOLS__': JSON.stringify(false),
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false)
      })
    ]
  }
})
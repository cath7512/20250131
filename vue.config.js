const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true, // Include if you have dependencies needing transpilation
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(true) // For better hydration mismatch error messages
      })
    ],
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          type: 'asset/resource', // Modern asset handling (Webpack 5+)
          generator: {
            filename: 'assets/country_flags/[name][ext]' // Simplified filename generation
          }
        }
      ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all',  // Optimize chunks for better loading performance
      },
    },
  },
  devServer: {
    client: {
      webSocketURL: {
        // hostname: 'localhost',  // Or your server's hostname
        // protocol: 'ws',         // Or 'wss' if your server uses SSL
        // port: 8080,           // Your server's port (if different from the dev server port)
        // pathname: '/ws',       // Your WebSocket endpoint path (if any)
      },
    },
  },
  productionSourceMap: true,  // Enable source maps in production (helps with debugging)
  lintOnSave: false,  // Disable linting during development (optional, but can speed up development)
});

import { defineConfig } from '@vue/cli-service';

export default {
  presets: [
    ['@vue/cli-plugin-babel/preset', {
      useBuiltIns: false,  // Disable automatic polyfill injection
      modules: false       // Let webpack handle modules
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: false,      // Disable corejs in runtime
      helpers: true,
      regenerator: true
    }]
  ]
}

module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'entry',
      corejs: 3,
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'not dead']
      }
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ],
  sourceType: 'module',
  assumptions: {
    "setPublicClassFields": true
  }
};

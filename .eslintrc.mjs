export default {
  root: true,
  env: {
    node: true,
    browser: true,
    es2020: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'warn',
    'vue/no-unused-components': 'warn',
    'no-undef': 'off'
  },
  globals: {
    google: 'readonly',
    process: true
  }
}

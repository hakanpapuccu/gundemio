const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['node_modules/**', 'stitch/**', 'dist/**'],
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
  prettierConfig,
]);

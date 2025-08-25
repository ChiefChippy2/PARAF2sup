import js from '@eslint/js';
import globals from 'globals';
import {defineConfig} from 'eslint/config';
import google from 'eslint-config-google';
delete google.rules['valid-jsdoc'];
delete google.rules['require-jsdoc'];

export default defineConfig([
  {files: ['**/*.{js,mjs,cjs}'], plugins: {js}, extends: ['js/recommended'], languageOptions: {globals: globals.node}},
  {files: ['**/*.js'], languageOptions: {sourceType: 'commonjs'}},
  google,
  {rules: {
    'max-len': 'warn',
    'n/global-require': 'off',
  }},
]);

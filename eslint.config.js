import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Remove this legacy compatibility when typescript-eslint supports flat config
const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ resolvePluginsRelativeTo: __dirname });

export default [
  {
    ignores: [
      '**/node_modules',
      '**/build',
      '**/dist',
      '**/lib',
      '**/public',
      '**/.esbuild',
      '**/.serverless',
    ],
  },
  js.configs.recommended,
  reactRecommended,
  reactJsxRuntime,
  eslintPluginPrettierRecommended,
  ...compat.config({
    root: true,
    extends: ['plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { ignoreRestSiblings: true, varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
    },
  }),
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: { 'react-hooks': reactHooks, 'unused-imports': unusedImports },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];

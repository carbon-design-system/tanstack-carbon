import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 0,
      'react/prop-types': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      'react-hooks/exhaustive-deps': 2,
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      parser: {
        meta: {
          name: 'Ignore Without Parsing',
        },

        // Ignore Parsing error
        parse: function () {
          return {
            type: 'Program',
            loc: {},
            comments: [],
            range: [0, 0],
            body: [],
            tokens: [],
          };
        },
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
    rules: {
      'no-duplicate-imports': 'error',
    },
  },
  {
    ignores: ['**/dist'],
  },
];

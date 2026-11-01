import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `dist` in the frontend and any node_modules tree must never be linted.
  globalIgnores(['**/dist/**', '**/node_modules/**', '**/.vite/**']),

  // Browser / React code.
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // Context files intentionally export both a provider component and a hook.
  {
    files: ['**/src/context/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  // Node / CommonJS API code. The second pattern keeps this working when ESLint
  // is invoked from inside frontend/ instead of the repository root.
  {
    files: ['server/**/*.{js,cjs}', '../server/**/*.{js,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])

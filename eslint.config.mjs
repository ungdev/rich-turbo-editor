import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import typescriptPlugin from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([globalIgnores(['eslint.config.mjs']),
{
  extends: [
    typescriptPlugin.configs.recommended, eslintConfigPrettier, importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript,
  ],

  languageOptions: {
    parser: tsParser,
    ecmaVersion: 5,
    sourceType: 'module',

    parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module',
    },
  },

  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-unresolved': 'off',
    'import/order': 'error'
  },
  files: ['**/*.ts'],
},
]);

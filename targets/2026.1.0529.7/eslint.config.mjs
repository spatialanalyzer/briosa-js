import eslint from '@eslint/js';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const repositoryRoot = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'src/generated/**', 'artifacts/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.test.json'],
        tsconfigRootDir: repositoryRoot,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },
  {
    // Production code builds gRPC clients only through newServiceClient in
    // src/transport.ts, which supplies the channel options; reflection could
    // bypass it (https://github.com/spatialanalyzer/briosa-js/issues/55).
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'Reflect',
          property: 'construct',
          message:
            'Construct gRPC clients only through newServiceClient in src/transport.ts.',
        },
      ],
    },
  },
  {
    files: ['eng/**/*.mjs', 'eslint.config.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
);

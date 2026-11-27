// Shared Niin ESLint config. Source of truth: niin-ci/templates/eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', '*.config.js', 'scripts/**'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: [] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='Math'][property.name='random']",
          message: 'Math.random is not a CSPRNG. Use node:crypto (security.md §2).',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'jsonwebtoken', message: 'Use jose (components.md §5).' },
            { name: 'crypto-js', message: 'Use node:crypto (components.md §5).' },
            { name: 'node-forge', message: 'Use node:crypto (components.md §5).' },
            {
              name: 'axios',
              message: 'Use the SafeFetch helper for outbound calls (security.md §5).',
            },
            { name: '@prisma/client', message: 'Use Kysely (ADR 0009).' },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
);

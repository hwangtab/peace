import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import jestPlugin from 'eslint-plugin-jest';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  // next/core-web-vitals: react, react-hooks, import, jsx-a11y, @next/next + TS parser
  ...nextCoreWebVitals,
  // next/typescript: @typescript-eslint recommended rules
  ...nextTypescript,
  // jsx-a11y recommended rules — plugin already registered by next/core-web-vitals, rules only
  { rules: jsxA11y.configs.recommended.rules },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'react/jsx-no-target-blank': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/self-closing-comp': 'error',
      'react-hooks/set-state-in-effect': 'warn',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/heading-has-content': 'error',
    },
  },
  {
    ...jestPlugin.configs['flat/recommended'],
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}', '**/__tests__/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ...jestPlugin.configs['flat/recommended'].languageOptions,
      globals: {
        ...jestPlugin.configs['flat/recommended'].languageOptions?.globals,
        ...globals.jest,
      },
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'patches/**',
      'src/data/timetable-2026.ts',
    ],
  },
];

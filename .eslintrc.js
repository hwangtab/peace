module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['jsx-a11y', '@typescript-eslint'],
  env: {
    browser: true,
    node: true,
    es6: true
  },
  overrides: [
    {
      files: ['**/*.{test,spec}.{ts,tsx,js,jsx}', '**/__tests__/**/*.{ts,tsx,js,jsx}'],
      extends: ['plugin:jest/recommended'],
      env: {
        jest: true
      }
    }
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',

    // React
    'react/jsx-no-target-blank': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/self-closing-comp': 'error',

    // Accessibility
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/heading-has-content': 'error'
  }
};

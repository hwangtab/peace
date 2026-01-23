module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:jsx-a11y/recommended'
  ],
  plugins: ['jsx-a11y'],
  env: {
    browser: true,
    node: true,
    es6: true
  },
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

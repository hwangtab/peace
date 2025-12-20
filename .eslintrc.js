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
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/jsx-no-target-blank': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/heading-has-content': 'error'
  }
};

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.tsx'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/.worktrees/',
    '/\\._',
    '<rootDir>/naughty-carson/',
    '<rootDir>/friendly-northcutt/',
    '<rootDir>/elated-montalcini/',
    '<rootDir>/goofy-merkle/',
    '<rootDir>/jolly-ritchie/',
    '<rootDir>/xenodochial-beaver/',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/.worktrees/',
    '<rootDir>/naughty-carson/',
    '<rootDir>/friendly-northcutt/',
    '<rootDir>/elated-montalcini/',
    '<rootDir>/goofy-merkle/',
    '<rootDir>/jolly-ritchie/',
    '<rootDir>/xenodochial-beaver/',
  ],
};

module.exports = createJestConfig(customJestConfig);

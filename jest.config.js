module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s'],
  // Coverage is enabled via CLI (--coverage); these control what gets measured when enabled
  collectCoverageFrom: [
    '<rootDir>/models/**/*.js',
    '<rootDir>/services/**/*.js',
    '<rootDir>/utils.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
};

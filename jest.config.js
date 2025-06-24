// jest.config.js

export default {
  // The test environment that will be used for testing
  testEnvironment: 'node',

  // Increase the default timeout to 30 seconds
  testTimeout: 30000,

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src'],

  // The testMatch pattern tells Jest to look for tests
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
  ],
};
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  openHandlesTimeout: 1000,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
  ],
  coverageReporters: ['text', 'lcov'],
};
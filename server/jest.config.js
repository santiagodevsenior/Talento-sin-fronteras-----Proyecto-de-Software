module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
  ],
  coverageReporters: ['text', 'lcov'],
  testSequencer: './testSequencer.js',
  forceExit: true,
  openHandlesTimeout: 1000,
};
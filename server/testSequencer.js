const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    return tests.sort((a, b) => {
      if (a.path.includes('auth')) return -1;
      if (b.path.includes('auth')) return 1;
      return 0;
    });
  }
}

module.exports = CustomSequencer;
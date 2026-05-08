const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { getExeDir, getExePath } = require('./context-bridge.cjs');

test('getExeDir returns the correct bin directory path', () => {
  const expected = path.join(__dirname, '..', 'bin');
  const actual = getExeDir();
  assert.strictEqual(actual, expected, 'getExeDir should return the path to the bin directory');
});

test('getExePath returns the correct executable path in dev mode', () => {
  // In the test environment, process.resourcesPath is likely undefined
  if (!process.resourcesPath) {
    const expected = path.join(__dirname, '..', 'bin', 'ContextReader.exe');
    const actual = getExePath();
    assert.strictEqual(actual, expected, 'getExePath should return the path to ContextReader.exe in dev mode');
  }
});

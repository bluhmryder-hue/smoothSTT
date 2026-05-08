/**
 * context-bridge.test.cjs - Unit tests for context-bridge.cjs
 * Created: 2025-05-08T07:55:00Z
 * Last Modified: 2025-05-08T07:55:00Z
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

// We need to require it after mocking if possible, but since it's already defined,
// we might need to be careful. However, getExePath uses the global process and fs.
const { getExePath } = require('./context-bridge.cjs');

test('getExePath', async (t) => {
  const originalResourcesPath = process.resourcesPath;
  const originalAccessSync = fs.accessSync;

  t.afterEach(() => {
    process.resourcesPath = originalResourcesPath;
    fs.accessSync = originalAccessSync;
  });

  await t.test('returns packaged path when process.resourcesPath is set and file exists', () => {
    process.resourcesPath = path.sep + 'mock_resources';
    const expectedPackagedPath = path.join(process.resourcesPath, 'bin', 'ContextReader.exe');

    fs.accessSync = (p) => {
      if (p === expectedPackagedPath) return;
      throw new Error('Not found');
    };

    const result = getExePath();
    assert.strictEqual(result, expectedPackagedPath);
  });

  await t.test('falls back to dev path when process.resourcesPath is set but file does not exist', () => {
    process.resourcesPath = path.sep + 'mock_resources';
    fs.accessSync = () => {
      throw new Error('File not found');
    };

    const result = getExePath();
    const expected = path.join(__dirname, '..', 'bin', 'ContextReader.exe');
    assert.strictEqual(result, expected);
  });

  await t.test('returns dev path when process.resourcesPath is undefined', () => {
    // Ensure it is undefined
    const val = process.resourcesPath;
    delete process.resourcesPath;

    try {
      const result = getExePath();
      const expected = path.join(__dirname, '..', 'bin', 'ContextReader.exe');
      assert.strictEqual(result, expected);
    } finally {
      process.resourcesPath = val;
    }
  });
});

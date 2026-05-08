const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { getExePath } = require('./context-bridge.cjs');

test('getExePath tests', async (t) => {
  const originalResourcesPath = process.resourcesPath;

  await t.test('returns fallback path when process.resourcesPath is undefined', () => {
    delete process.resourcesPath;
    const expected = path.join(__dirname, "..", "bin", "ContextReader.exe");
    assert.strictEqual(getExePath(), expected);
  });

  await t.test('returns packaged path when process.resourcesPath is defined and access succeeds', (t) => {
    process.resourcesPath = '/mock/resources';
    const expected = path.join(process.resourcesPath, "bin", "ContextReader.exe");

    t.mock.method(fs, 'accessSync', (path) => {
      if (path === expected) return;
      throw new Error('File not found');
    });

    assert.strictEqual(getExePath(), expected);
  });

  await t.test('returns fallback path when process.resourcesPath is defined but access fails', (t) => {
    process.resourcesPath = '/mock/resources';
    const fallbackExpected = path.join(__dirname, "..", "bin", "ContextReader.exe");

    t.mock.method(fs, 'accessSync', () => {
      throw new Error('Access denied');
    });

    assert.strictEqual(getExePath(), fallbackExpected);
  });

  // Restore process.resourcesPath
  if (originalResourcesPath === undefined) {
    delete process.resourcesPath;
  } else {
    process.resourcesPath = originalResourcesPath;
  }
});

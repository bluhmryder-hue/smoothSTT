const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Import the module under test
const { getBinaryPath, getWindowContext } = require('./index.cjs');

test('getBinaryPath scenarios', async (t) => {

  await t.test('returns dev path when process.resourcesPath is undefined', () => {
    const originalResourcesPath = process.resourcesPath;
    // In Node.js, process.resourcesPath is usually undefined unless set
    delete process.resourcesPath;

    try {
      const result = getBinaryPath();
      const expected = path.join(__dirname, "bin", "context-reader");
      assert.strictEqual(result, expected);
    } finally {
      process.resourcesPath = originalResourcesPath;
    }
  });

  await t.test('returns packaged path when process.resourcesPath is defined and binary exists', (t) => {
    const originalResourcesPath = process.resourcesPath;
    process.resourcesPath = '/mock/resources';

    const packagedPath = path.join(process.resourcesPath, 'bin', 'context-reader');

    const accessSyncMock = t.mock.method(fs, 'accessSync', (p) => {
      if (p === packagedPath) {
        return; // success
      }
      throw new Error('File not found');
    });

    try {
      const result = getBinaryPath();
      assert.strictEqual(result, packagedPath);
      assert.strictEqual(accessSyncMock.mock.callCount(), 1);
    } finally {
      process.resourcesPath = originalResourcesPath;
    }
  });

  await t.test('returns dev path when process.resourcesPath is defined but binary does not exist', (t) => {
    const originalResourcesPath = process.resourcesPath;
    process.resourcesPath = '/mock/resources';

    const accessSyncMock = t.mock.method(fs, 'accessSync', () => {
      throw new Error('File not found');
    });

    try {
      const result = getBinaryPath();
      const expected = path.join(__dirname, "bin", "context-reader");
      assert.strictEqual(result, expected);
      assert.strictEqual(accessSyncMock.mock.callCount(), 1);
    } finally {
      process.resourcesPath = originalResourcesPath;
    }
  });
});

test('getWindowContext platform edge cases', async (t) => {
  await t.test('returns null immediately on non-darwin platforms', async () => {
    const originalPlatform = process.platform;

    // Force platform to something other than darwin
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true
    });

    try {
      const result = await getWindowContext();
      assert.strictEqual(result, null, 'Should return null on non-darwin platform');
    } finally {
      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    }
  });
});

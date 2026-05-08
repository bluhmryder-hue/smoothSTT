/**
 * Context Bridge Unit Tests
 * Created: 2026-05-08T08:04:36Z
 * Last Modified: 2026-05-08T08:04:36Z
 */
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');

// Import the function to test
const { getExePath } = require('./context-bridge.cjs');

test('getExePath functionality', async (t) => {
  const originalResourcesPath = process.resourcesPath;

  t.afterEach(() => {
    process.resourcesPath = originalResourcesPath;
  });

  await t.test('returns packaged path when process.resourcesPath is set and file exists', (t) => {
    // Mock process.resourcesPath
    process.resourcesPath = 'C:\\MockApp';

    // Mock fs.accessSync to succeed
    const accessMock = t.mock.method(fs, 'accessSync', () => {});

    const expectedPath = path.join('C:\\MockApp', 'bin', 'ContextReader.exe');
    const actualPath = getExePath();
    assert.strictEqual(actualPath, expectedPath);
    assert.strictEqual(accessMock.mock.callCount(), 1);
    assert.strictEqual(accessMock.mock.calls[0].arguments[0], expectedPath);
  });

  await t.test('falls through to dev path when process.resourcesPath is set but file does not exist', (t) => {
    // Mock process.resourcesPath
    process.resourcesPath = 'C:\\MockApp';

    // Mock fs.accessSync to throw
    const accessMock = t.mock.method(fs, 'accessSync', () => {
      throw new Error('File not found');
    });

    const actualPath = getExePath();
    // Dev path: __dirname/../bin/ContextReader.exe
    const expectedPath = path.join(__dirname, '..', 'bin', 'ContextReader.exe');
    assert.strictEqual(actualPath, expectedPath);
    assert.strictEqual(accessMock.mock.callCount(), 1);
  });

  await t.test('returns dev path when process.resourcesPath is not set', (t) => {
    // Ensure process.resourcesPath is undefined
    delete process.resourcesPath;

    // Mock fs.accessSync to ensure it's NOT called
    const accessMock = t.mock.method(fs, 'accessSync', () => {});

    const actualPath = getExePath();
    const expectedPath = path.join(__dirname, '..', 'bin', 'ContextReader.exe');
    assert.strictEqual(actualPath, expectedPath);
    assert.strictEqual(accessMock.mock.callCount(), 0);
  });
});

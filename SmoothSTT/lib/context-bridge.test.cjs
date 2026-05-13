/**
 * context-bridge.test.cjs - Unit tests for context-bridge.cjs
 * Consolidated from multiple PR branches:
 * - testing-improvement-getexedir-5817184782188859121 (getExeDir tests)
 * - testing-improvement-get-exe-path-9746111318519709231 (getExePath error case)
 * - jules-17532740560160616416-d197496f (getExePath success case)
 * - test-getWindowContext-non-win32-4980122736291762583 (non-win32 edge case)
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('fs');

const { getExeDir, getExePath, getWindowContext } = require('./context-bridge.cjs');

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

test('getExePath returns packaged path when process.resourcesPath is set and file exists', () => {
  const originalResourcesPath = process.resourcesPath;
  
  process.resourcesPath = path.sep + 'mock_resources';
  const expectedPackagedPath = path.join(process.resourcesPath, 'bin', 'ContextReader.exe');
  
  // Mock fs.accessSync to simulate the file existing
  const originalAccessSync = fs.accessSync;
  fs.accessSync = (p) => {
    if (p === expectedPackagedPath) return;
    throw new Error('Not found');
  };
  
  try {
    const result = getExePath();
    assert.strictEqual(result, expectedPackagedPath, 'getExePath should return packaged path when available');
  } finally {
    process.resourcesPath = originalResourcesPath;
    fs.accessSync = originalAccessSync;
  }
});

test('getExePath falls back to dev path when packaged path does not exist', () => {
  const originalResourcesPath = process.resourcesPath;
  
  process.resourcesPath = path.sep + 'mock_resources';
  
  // Mock fs.accessSync to throw for all paths
  const originalAccessSync = fs.accessSync;
  fs.accessSync = () => {
    throw new Error('File not found');
  };
  
  try {
    const result = getExePath();
    const expected = path.join(__dirname, '..', 'bin', 'ContextReader.exe');
    assert.strictEqual(result, expected, 'getExePath should fallback to dev path when packaged does not exist');
  } finally {
    process.resourcesPath = originalResourcesPath;
    fs.accessSync = originalAccessSync;
  }
});

test('getWindowContext returns null on non-win32 platforms', async (t) => {
  // Skip if on win32
  if (process.platform === 'win32') {
    t.skip();
    return;
  }
  
  const result = await getWindowContext();
  assert.strictEqual(result, null, 'getWindowContext should return null on non-win32 platforms');
});
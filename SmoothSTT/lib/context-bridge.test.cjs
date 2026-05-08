/**
 * SmoothSTT Context Bridge Tests
 * Created: 2025-05-22T12:00:00Z
 * Last Modified: 2025-05-22T12:00:00Z
 */
const test = require('node:test');
const assert = require('node:assert');
const { getWindowContext } = require('./context-bridge.cjs');

test('getWindowContext returns null on non-win32 platforms', async () => {
  const originalPlatform = process.platform;

  // Ensure we are testing the non-win32 path
  if (process.platform === 'win32') {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true
    });
  }

  try {
    const result = await getWindowContext();
    assert.strictEqual(result, null, 'Should return null on non-win32 platform');
  } finally {
    // Restore platform if we changed it
    if (originalPlatform === 'win32') {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true
      });
    }
  }
});

test('getWindowContext returns null when platform is explicitly mocked to darwin', async () => {
  const originalPlatform = process.platform;

  Object.defineProperty(process, 'platform', {
    value: 'darwin',
    configurable: true
  });

  try {
    const result = await getWindowContext();
    assert.strictEqual(result, null, 'Should return null on darwin');
  } finally {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true
    });
  }
});

const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Returns the absolute path to the context-reader binary.
 * Packaged Electron: process.resourcesPath/bin/context-reader
 * Dev mode: __dirname/bin/context-reader (inside node_modules)
 */
function getBinaryPath() {
  if (process.resourcesPath) {
    const packagedPath = path.join(process.resourcesPath, "bin", "context-reader");
    try {
      fs.accessSync(packagedPath);
      return packagedPath;
    } catch {
      // Fall through to module-relative path
    }
  }
  return path.join(__dirname, "bin", "context-reader");
}

/**
 * Returns the directory containing the context-reader binary.
 * Useful for electron-builder extraResources config.
 */
function getBinaryDir() {
  return path.join(__dirname, "bin");
}

/**
 * Spawns the context-reader binary, parses the JSON output,
 * and returns the parsed object. Returns null on error, timeout,
 * or non-macOS platforms.
 */
function getWindowContext() {
  if (process.platform !== "darwin") return Promise.resolve(null);

  return new Promise((resolve) => {
    execFile(getBinaryPath(), [], { timeout: 6000 }, (err, stdout) => {
      if (err) {
        resolve(null);
        return;
      }
      try {
        const data = JSON.parse(stdout);
        if (data && data.error) {
          resolve(null);
          return;
        }
        resolve(data);
      } catch {
        resolve(null);
      }
    });
  });
}

module.exports = { getWindowContext, getBinaryPath, getBinaryDir };

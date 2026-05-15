const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

/**
 * Returns the absolute path to ContextReader.exe.
 * Packaged Electron: process.resourcesPath/bin/ContextReader.exe
 * Dev mode: __dirname/bin/ContextReader.exe (inside node_modules)
 */
function getExePath() {
  if (process.resourcesPath) {
    const packagedPath = path.join(process.resourcesPath, "bin", "ContextReader.exe");
    try {
      fs.accessSync(packagedPath);
      return packagedPath;
    } catch (err) {
      // Fall through to module-relative path
      // console.debug("Packaged path not found, falling back to module-relative path", err);
    }
  }
  return path.join(__dirname, "bin", "ContextReader.exe");
}

/**
 * Returns the directory containing ContextReader.exe.
 * Useful for electron-builder extraResources config.
 */
function getExeDir() {
  return path.join(__dirname, "bin");
}

/**
 * Spawns ContextReader.exe, sends getFocusedWindow command,
 * and returns the parsed ProcessedOutput JSON.
 * Returns null on error, timeout, or non-Windows platforms.
 */
function getWindowContext() {
  if (process.platform !== "win32") return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    const timer = setTimeout(() => {
      try {
        if (child) child.kill();
      } catch (err) {
        console.error("Error killing child process on timeout:", err);
      }
      settle(null);
    }, 6000);

    let child;
    try {
      child = spawn(getExePath(), [], { stdio: ["pipe", "pipe", "pipe"] });
    } catch (err) {
      console.error("Error spawning ContextReader.exe:", err);
      settle(null);
      return;
    }

    child.on("error", () => settle(null));
    child.on("exit", () => settle(null));

    const rl = readline.createInterface({ input: child.stdout });

    rl.on("line", (line) => {
      try {
        const data = JSON.parse(line);
        if (data.error) {
          settle(null);
        } else {
          settle(data);
        }
        try {
          child.kill();
        } catch (err) {
          console.error("Error killing child process after success/data error:", err);
        }
      } catch (err) {
        console.error("Error parsing line from ContextReader.exe:", err, "Line:", line);
        settle(null);
        try {
          child.kill();
        } catch (killErr) {
          console.error("Error killing child process after parse error:", killErr);
        }
      }
    });

    child.stdin.write(JSON.stringify({ command: "getFocusedWindow" }) + "\n");
  });
}

module.exports = { getWindowContext, getExePath, getExeDir };

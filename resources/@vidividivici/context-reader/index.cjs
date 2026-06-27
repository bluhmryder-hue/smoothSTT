const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

/**
 * Returns the absolute path to ContextReader.exe or context-reader.exe.
 * Priority order:
 * 1. Clean-room context-reader Rust binary (new implementation)
 * 2. Legacy ContextReader.exe binary (fallback)
 */
function getExePath() {
  // 1. Check new clean-room Rust implementation first
  const cleanPaths = [
    path.join(__dirname, "..", "..", "native", "context-reader", "target", "release", "context-reader.exe"),
    path.join(process.resourcesPath, "native", "context-reader.exe"),
    path.join(__dirname, "..", "..", "native", "context-reader", "bin", "context-reader.exe"),
  ];

  for (const p of cleanPaths) {
    try {
      fs.accessSync(p);
      return p;
    } catch {}
  }

  // 2. Fallback to legacy ContextReader.exe
  const legacyPackaged = path.join(process.resourcesPath, "bin", "ContextReader.exe");
  try {
    fs.accessSync(legacyPackaged);
    return legacyPackaged;
  } catch {}

  const legacyModule = path.join(__dirname, "bin", "ContextReader.exe");
  try {
    fs.accessSync(legacyModule);
    return legacyModule;
  } catch {}

  // 3. Final fallback: same directory with normalized name
  return path.join(__dirname, "bin", "context-reader.exe");
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

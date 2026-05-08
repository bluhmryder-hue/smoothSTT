/**
 * SmoothSTT Context Bridge
 * Created: 2025-05-22T12:00:00Z
 * Last Modified: 2025-05-22T12:00:00Z
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

/**
 * Returns the absolute path to ContextReader.exe.
 * Packaged Electron: process.resourcesPath/bin/ContextReader.exe
 * Dev mode: __dirname/../bin/ContextReader.exe
 */
function getExePath() {
  if (process.resourcesPath) {
    const packagedPath = path.join(process.resourcesPath, "bin", "ContextReader.exe");
    try {
      fs.accessSync(packagedPath);
      return packagedPath;
    } catch {
      // Fall through
    }
  }
  return path.join(__dirname, "..", "bin", "ContextReader.exe");
}

/**
 * Returns the directory containing ContextReader.exe.
 */
function getExeDir() {
  return path.join(__dirname, "..", "bin");
}

/**
 * Spawns ContextReader.exe, sends getFocusedWindow command,
 * and returns the parsed ProcessedOutput JSON.
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
      try { if (child) child.kill(); } catch {}
      settle(null);
    }, 6000);

    let child;
    try {
      child = spawn(getExePath(), [], { stdio: ["pipe", "pipe", "pipe"] });
    } catch {
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
        try { child.kill(); } catch {}
      } catch {
        settle(null);
        try { child.kill(); } catch {}
      }
    });

    child.stdin.write(JSON.stringify({ command: "getFocusedWindow" }) + "\n");
  });
}

module.exports = { getWindowContext, getExePath, getExeDir };

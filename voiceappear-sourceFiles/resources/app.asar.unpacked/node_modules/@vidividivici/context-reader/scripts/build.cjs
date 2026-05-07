const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

// Find cmake
const cmakePaths = [
  "cmake",
  "C:\\Program Files\\CMake\\bin\\cmake.exe",
];

let cmake;
for (const p of cmakePaths) {
  try {
    execSync(`"${p}" --version`, { stdio: "ignore" });
    cmake = p;
    break;
  } catch {}
}

if (!cmake) {
  console.error("cmake not found");
  process.exit(1);
}

console.log("Using cmake:", cmake);
execSync(`"${cmake}" -S . -B build`, { cwd: root, stdio: "inherit" });
execSync(`"${cmake}" --build build --config Release`, { cwd: root, stdio: "inherit" });

fs.mkdirSync(path.join(root, "bin"), { recursive: true });
fs.copyFileSync(
  path.join(root, "build", "Release", "ContextReader.exe"),
  path.join(root, "bin", "ContextReader.exe")
);
console.log("Built bin/ContextReader.exe");

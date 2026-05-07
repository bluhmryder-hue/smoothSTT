const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "src", "context-reader.swift");
const buildDir = path.join(root, "build");
const binDir = path.join(root, "bin");
const outArm = path.join(buildDir, "context-reader-arm64");
const outX86 = path.join(buildDir, "context-reader-x86_64");
const finalOut = path.join(binDir, "context-reader");

fs.mkdirSync(buildDir, { recursive: true });
fs.mkdirSync(binDir, { recursive: true });

const flags = ["-framework", "ApplicationServices", "-framework", "AppKit", "-O"];

console.log("Building arm64 slice...");
execSync(
  ["swiftc", "-target", "arm64-apple-macos11", `"${src}"`, "-o", `"${outArm}"`, ...flags].join(" "),
  { stdio: "inherit" }
);

console.log("Building x86_64 slice...");
execSync(
  ["swiftc", "-target", "x86_64-apple-macos11", `"${src}"`, "-o", `"${outX86}"`, ...flags].join(" "),
  { stdio: "inherit" }
);

console.log("Combining slices into universal binary...");
execSync(`lipo -create -output "${finalOut}" "${outArm}" "${outX86}"`, { stdio: "inherit" });

fs.rmSync(outArm);
fs.rmSync(outX86);

console.log("Built bin/context-reader (universal)");

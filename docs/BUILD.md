# SmoothSTT Build Guide

## Prerequisites
- Windows 10/11
- Node.js >= 26.1.0
- npm
- Rust toolchain (`rustup`, `cargo`) for native components
- ffmpeg installed on PATH

## Source build
```bash
npm install
```

## Native components
```bash
cd D:/LLM/Repos/smoothSTT/resources/native/context-reader
cargo build --release --target x86_64-pc-windows-msvc

cd D:/LLM/Repos/smoothSTT/resources/native/insert-bridge
cargo build --release --target x86_64-pc-windows-msvc
```

## Packaging
```bash
cd D:/LLM/Repos/smoothSTT
npm run build:nsis
npm run build:portable
```

## Start app from source
```bash
npm start
```

## Test
```bash
npm test
```

## Outputs
```text
dist-installer/SmoothSTT-0.1.0-win-x64.exe
dist-installer/SmoothSTT-0.1.0-win-portable.exe
dist-installer/SmoothSTT-0.1.0-win-x64.exe.blockmap
```

These outputs are build artifacts and are not tracked in git.

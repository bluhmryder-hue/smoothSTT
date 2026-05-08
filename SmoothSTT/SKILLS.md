# SmoothSTT Technical Skills (SKILLS.md)
**Created:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Last Modified:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")

The following technical competencies are required for the development and maintenance of SmoothSTT.

## 1. Native Node.js Addons (N-API)
- Ability to interface with `.node` binaries.
- Understanding of the Node.js event loop vs. native thread execution (crucial for keyboard hooks).
- Experience with `node-gyp` (if recompilation is required for Node v26).

## 2. Windows UI Automation (UIA)
- Knowledge of the Microsoft UI Automation framework.
- Ability to interpret JSON payloads from `ContextReader.exe`.
- Understanding of `HWND`, `caretPosition`, and focus lifecycle in Windows.

## 3. Local ML Inference (GGML/Whisper)
- Expertise in `Whisper.cpp` or `Faster-Whisper`.
- Knowledge of GGML model formats and quantization (4-bit vs. 8-bit for performance).
- Experience with real-time audio stream piping into inference engines.

## 4. Electron Inter-Process Communication (IPC)
- Secure implementation of `ipcMain` and `ipcRenderer`.
- Knowledge of Electron's "Context Isolation" and "Sandbox" mode.
- High-performance UI rendering for frameless/transparent windows.

## 5. Audio Processing
- Understanding of PCM 16kHz mono audio requirements for STT.
- Proficiency with `node-record-lpcm16` and `FFMPEG` stream manipulation.

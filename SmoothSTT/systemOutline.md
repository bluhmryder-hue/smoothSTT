# SmoothSTT System Outline & Functional Mapping
**Created:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Last Modified:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## 1. Project Vision
SmoothSTT is a high-performance, local-first Speech-to-Text (STT) and automation tool. It succeeds VoiceAppear by leveraging its core native engines while introducing a modern, modular architecture optimized for the 2026 technical landscape (Node v26, Electron v42).

The core workflow follows a strict A→B→C coherence pipeline:
- **A (Capture):** Global hotkey hook detects user intent and locks onto the active text input box.
- **B (Process):** Local ML (Whisper.cpp) transcribes the 16kHz mono audio stream in real-time.
- **C (Inject):** ContextReader.exe identifies the insertion point, and the system injects the transcribed text precisely at the caret position.

---

## 2. Exhaustive Mapping of VoiceAppear Source Files
This section maps every file found in the `voiceappear-sourceFiles` directory and defines its function.

### Root Directory (Electron Runtime Environment)
- `LICENSE.electron.txt`: Legal notice for the Electron framework.
- `Uninstall VoiceAppear.exe`: Windows uninstaller executable.
- `chrome_100_percent.pak`: Compressed UI resources for standard resolution displays.
- `chrome_200_percent.pak`: Compressed UI resources for high-DPI (Retina/4K) displays.
- `d3dcompiler_47.dll`: Microsoft Direct3D Shader compiler. Required for GPU-accelerated UI rendering.
- `ffmpeg.dll`: Multi-format media codec library. Used for audio stream processing.
- `icudtl.dat`: "International Components for Unicode" data file. Required for character encoding and localization.
- `libEGL.dll`: Interface between Khronos rendering APIs (like OpenGL ES) and the underlying native window system.
- `libGLESv2.dll`: Implementation of the OpenGL ES 2.0 rendering API.
- `resources.pak`: Primary resource bundle for the Chromium browser engine.
- `snapshot_blob.bin`: Binary data used by the V8 engine to speed up initialization.
- `v8_context_snapshot.bin`: Pre-compiled V8 heap snapshot for the main process.

### /locales
- `en-US.pak`: Localization strings for United States English.

### /resources (Application Metadata & Helpers)
- `app-update.yml`: Configuration for the `electron-updater` module. Contains update URLs and channels.
- `elevate.exe`: A small utility used to prompt the user for Administrative privileges (User Account Control).
- `favicon.ico`: The application icon displayed in the taskbar and window frame.

### /resources/bin (Proprietary Native Tools)
- `ContextReader.exe`: **Critical Component.** A C++/C# binary that uses the Windows UI Automation (UIA) API to "look inside" other applications. It returns JSON data containing the text content, window title, and cursor position of the focused element.

### /resources/build/Release (Custom Native Addons)
- `keyboard_hook.node`: A compiled Node.js Native Addon (N-API). It installs a low-level keyboard hook (`WH_KEYBOARD_LL`) to capture hotkeys globally, even when the app is out of focus.

### /resources/native/goodpaste-win (Injection Tools)
- `ClipPaste.exe`: A high-performance utility designed to perform a "blind paste" operation. It manipulates the Windows clipboard and sends a `Ctrl+V` signal at the hardware level to ensure text is injected without dropping characters.

### /resources/app.asar.unpacked (External Dependencies)
Electron unpacks these files because they are native binaries that cannot be executed from within a compressed `.asar` archive.

#### /node_modules/native-sound-mixer
- `dist/addons/win-sound-mixer.node`: The Windows-specific driver for the sound mixer.
- `dist/sound-mixer.js`: The Javascript interface for the mixer.
- `LICENSE`, `package.json`: Metadata for the sound mixer library.

#### /node_modules/uiohook-napi
- `dist/index.js`: The entry point for the uiohook library.
- `prebuilds/win32-x64/uiohook-napi.node`: The compiled binary for global mouse/keyboard events.
- `libuiohook/src/...`: C source code for the underlying libuiohook library (Windows, Darwin, X11 versions included).

#### /node_modules/@vidividivici/context-reader
- `index.cjs`: The Javascript bridge that spawns `ContextReader.exe` and parses its JSON output.
- `bin/ContextReader.exe`: A duplicate of the root-level binary, stored within the module for portability.

---

## 3. SmoothSTT Final Architecture
SmoothSTT will reorganize these "liberated" components into a cleaner, more maintainable structure.

### `/SmoothSTT/bin`
Central repository for all standalone executables.
- `ContextReader.exe`
- `ClipPaste.exe`

### `/SmoothSTT/lib`
Standardized bridges for native functionality.
- `context-bridge.cjs`: (formerly `index.cjs`) - Updated to point to the new `bin/` path.
- `sound-mixer.node`: Extracted from the `native-sound-mixer` package.
- `keyboard-hook.node`: Extracted for global trigger detection.

### `/SmoothSTT/src`
New application logic.
- `main.js`: Electron Main process (Tray, Window Management).
- `stt-engine.js`: Whisper.cpp integration and audio pipeline.
- `automation.js`: Future AI-driven automation tasks.

### `/SmoothSTT/recordings`
A directory for volatile audio data (ignored by git).

---

## 4. Coherence Pipeline (The A→B→C Path)
To maintain the project's "Original Intent," every feature must pass through this pipeline:

1.  **TRIGGER (A):** The `keyboard_hook.node` detects the hotkey.
2.  **CONTEXT (A):** `ContextReader.exe` captures the string and cursor position.
3.  **FEEDBACK (A):** The Toast UI displays "Listening" at the cursor's X/Y coordinates.
4.  **RECORD (B):** `node-record-lpcm16` pipes audio to `stt-engine.js`.
5.  **INFERENCE (B):** `Whisper.cpp` generates a local transcription.
6.  **INJECTION (C):** `ClipPaste.exe` appends the text to the captured context.
7.  **VERIFICATION (C):** The system checks if the text was correctly placed at the `caretPosition`.

---

## 5. Verification Metrics
- **Latency:** End-to-end (Silence to Injection) < 750ms.
- **Accuracy:** Zero-character drift on injection.
- **Privacy:** 100% Local. No external API calls.

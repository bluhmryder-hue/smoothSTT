# SmoothSTT: High-Performance Local Automation & STT
**Created:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Last Modified:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")

SmoothSTT is a professional-grade, local-first Speech-to-Text (STT) and automation tool designed for Windows. It allows users to hover over any text input, press a hotkey, speak, and have their words instantly injected at the exact cursor position—all without ever sending data to the cloud.

---

## 1. Filetree Structure
```text
/SmoothSTT
├── /bin                  # Compiled proprietary executables
│   ├── ContextReader.exe # Scrapes UI elements for text/cursor data
│   └── ClipPaste.exe     # High-speed text injection utility
├── /lib                  # Native Node.js Bridges
│   ├── context-bridge.cjs # JS interface for ContextReader
│   ├── sound-mixer.node  # Audio device management
│   └── keyboard-hook.node# Global hotkey listener
├── /src                  # Core Application Logic
│   ├── main.js           # Electron Main Process & Tray
│   ├── stt-engine.js     # Whisper.cpp & Audio Pipeline
│   └── automation.js     # AI Logic & Action Framework
├── /recordings           # Volatile audio storage (Git ignored)
├── test-harness.js       # Developer scratchpad for experiments
├── package.json          # Metadata (Node v26.1.0, Electron v42.0.0)
├── .env-sample           # Environment template
└── AGENT.md              # Protocols for AI contributors
```

---

## 2. How It Works (The A→B→C Pipeline)
1.  **A (Capture):** You hover your mouse over an input box and hold the Trigger Key (e.g., Caps Lock). SmoothSTT "locks" the context using `ContextReader.exe`.
2.  **B (Process):** A Toast window appears at your cursor. `node-record-lpcm16` captures your voice, and `Whisper.cpp` transcribes it locally on your CPU/GPU.
3.  **C (Inject):** Upon releasing the key, the transcription is cleaned and injected precisely at your cursor position using `ClipPaste.exe`.

---

## 3. Environment Setup
1.  **Prerequisites:**
    - Node.js v26.1.0
    - Windows 10/11 (required for UIA binaries)
    - GPU with CUDA support (optional, for faster Whisper inference)
2.  **Installation:**
    ```bash
    npm install
    cp .env-sample .env
    ```
3.  **Configuration:**
    Edit `.env` to set your `WHISPER_MODEL_PATH` and `TRIGGER_KEY_CODE`.

---

## 4. Verification & Testing
To ensure the system is working correctly, run:
```bash
node test-harness.js --mode hook   # Verifies the hotkey trigger
node test-harness.js --mode scrape # Verifies ContextReader can see your active window
node test-harness.js --mode audio  # Verifies 16kHz audio capture
```

---

## 5. Troubleshooting
- **Toast window not appearing?** Check if SmoothSTT has "Permit to draw over other apps" or is being blocked by a full-screen application.
- **Text injection failing?** Ensure the target application is not running with higher privileges (Admin) than SmoothSTT.
- **High Latency?** Switch to a smaller Whisper model (e.g., `tiny.en` or `base.en`) in your `.env` settings.

---

## 6. Credits & License
- **Original Engine Source:** VoiceAppear (@vidividivici)
- **License:** MIT (c) 2026 Ryder Bluhm

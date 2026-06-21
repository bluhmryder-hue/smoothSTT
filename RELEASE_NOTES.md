# SmoothSTT 0.1.0

First public build of SmoothSTT — a local, Windows-first dictation tool that captures text at the cursor and types it directly into any app.

## What it does
- Global dictation trigger with configurable key
- Captures context near the cursor
- Uses Whisper.cpp for transcription
- Types results directly into the active window
- System tray with quick controls
- Event log and transcript history

## Requirements
- Windows 10/11
- A running Whisper.cpp server at `http://127.0.0.1:6758`
- ffmpeg installed on PATH

## Install
Run `SmoothSTT-0.1.0-win-x64.exe` and follow the installer.
Default install location: `C:\Program Files\SmoothSTT`

On first launch you will be prompted to choose a dictation key.

## Known limitations
- First public build; feedback welcome
- Whisper server must be preconfigured
- Some OCR/context-reader components are still being reviewed for licensing

## Roadmap
- Polish and stability fixes
- In-app server configuration
- Improved model fallback support
- Licensing and distribution finalized

## License
To be announced. All rights reserved until terms are published.

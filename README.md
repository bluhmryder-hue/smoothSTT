# SmoothSTT

Local, Windows-first dictation tool. Press a key, speak, and the text appears at your cursor.

No cloud, no subscriptions, no accounts. Just you, a headset, and Whisper running locally.

## How it works

1. You press the dictation hotkey
2. SmoothSTT records audio for a few seconds
3. It sends the audio to a local Whisper.cpp server
4. The transcript is inserted directly into the focused window
5. A toast notification confirms what was typed

Under the hood it uses a context reader and a paste bridge so text lands exactly where your cursor was — same idea as VoiceAppear, but as a standalone tool.

## Features

- Global dictation hotkey, configurable on first run
- System tray with quick controls
- Whisper.cpp server support (`127.0.0.1:6758`)
- Whisper CLI fallback
- Local config file in the app folder
- Transcript history
- Dark UI built for Windows 10/11

## Requirements

- Windows 10 or 11
- Node.js >= 26.1.0 (for building from source)
- ffmpeg installed on PATH
- A running Whisper.cpp server at `http://127.0.0.1:6758` (or a Whisper CLI path)

## Install

### From release
Download `SmoothSTT-0.1.0-win-x64.exe` from Releases and run the installer. It installs to `C:\Program Files\SmoothSTT` by default.

### From source
```bash
git clone https://github.com/bluhmryder-hue/smoothSTT.git
cd smoothSTT
npm install
npm start
```

### Build installer
```bash
npm run build:nsis
```

Outputs:
- `dist-installer/SmoothSTT-0.1.0-win-x64.exe`
- `dist-installer/SmoothSTT-0.1.0-win-portable.exe`
- `dist-installer/SmoothSTT-0.1.0-win-x64.exe.blockmap`

## First run

On first launch you’ll be asked to choose a dictation key. After that the app lives in the system tray. Right-click for quick controls.

## Config

Config is stored locally in `smoothstt-config.json` in the app folder. You can edit it directly or use Settings in the app.

Key options:
- `whisperEndpoint` — Whisper.cpp server URL
- `whisperCli` — fallback CLI path
- `whisperModelPath` — model file for CLI fallback
- `triggerKeyCode` — dictation hotkey
- `firstRunComplete` — set to `true` after setup

## Known limitations

- Whisper server must be preconfigured before dictation works
- Some third-party components are still being reviewed for licensing
- Windows-only; no macOS or Linux support yet

## Roadmap

- Built-in Whisper server management
- Improved model fallback support
- Custom voice profiles
- Licensing and distribution finalized
- macOS port

## License

To be announced. Built with care by Ryder Bluhm.

# Agent / Contributor Notes

Generated: 2026-06-21 16:39:48 CDT

## Project Context
SmoothSTT is a local Windows dictation tool built with Electron. It records audio, sends it to a local Whisper server or CLI, and inserts the transcript into the active window via a local paste bridge.

## Development Workflow
- Windows-first. Test on Windows before assuming cross-platform behavior.
- Run `npm test` before committing. It must show `[PROD OK]`.
- Installer outputs go to `dist-installer/` and are gitignored.
- Native binaries live in `resources/native/` and are gitignored for licensing reasons.
- Build resources live in `build-resources/` and are gitignored due to size.

## Commit Policy
- Keep commits focused and descriptive.
- Never commit credentials, API keys, or tokens.
- Do not delete user data or config without explicit confirmation.

## Licensing Notes
See `docs/LICENSES.md` before bundling or distributing third-party binaries.
Some bundled components are unlicensed and require replacement or permission before commercial release.

## Build Artifacts
- Installer: `dist-installer/SmoothSTT-0.1.0-win-x64.exe`
- Portable: `dist-installer/SmoothSTT-0.1.0-win-portable.exe`
- Blockmap: `dist-installer/SmoothSTT-0.1.0-win-x64.exe.blockmap`

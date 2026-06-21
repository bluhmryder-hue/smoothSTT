# Changelog

Generated: 2026-06-21 16:39:48 CDT

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Wire ClipPaste.exe into transcription pipeline for actual text insertion
- docs/BUILD.md with build and test instructions
- docs/LICENSES.md with third-party license audit
- RELEASE_NOTES.md for GitHub Releases
- README.md with project overview

### Changed
- Rename automation.js to clippaste-manager.js
- Simplify main UI to log, Start/Stop, and Settings
- Add first-run hotkey setup flow
- Add system tray with right-click menu
- Wire Start button to transcription engine

### Fixed
- Start button now triggers actual transcription instead of no-op

## [0.1.0] - 2026-06-20

### Added
- Initial production GUI
- Whisper.cpp server bridge
- Whisper CLI fallback
- NSIS and portable installer builds
- System tray support
- Settings persistence via JSON
- First-run setup flow

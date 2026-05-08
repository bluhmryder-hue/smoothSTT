# SmoothSTT Project Roadmap & TODO
**Created:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Last Modified:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Phase 1: Infrastructure (In Progress)
- [x] Define directory structure
- [x] Map legacy VoiceAppear binaries
- [x] Create core documentation (README, AGENT, TODO)
- [ ] Initialize `package.json` with Node 26/Electron 42 specs
- [ ] Extract and verify native bridges (`.node` files)

## Phase 2: The "A" Segment (Hooking & Context)
- [ ] Implement global key listener using `keyboard_hook.node`
- [ ] Implement `context-bridge.cjs` to invoke `ContextReader.exe`
- [ ] Build the "Toast" UI in Electron (transparent, cursor-anchored)
- [ ] Test: Verify cursor coordinates are passed correctly to the Toast window

## Phase 3: The "B" Segment (Audio & STT)
- [ ] Integrate `node-record-lpcm16` for microphone capture
- [ ] Setup `Whisper.cpp` Node.js bindings
- [ ] Implement logic to start/stop recording based on hotkey state
- [ ] Test: Measure transcription accuracy and latency

## Phase 4: The "C" Segment (Injection & Coherence)
- [ ] Implement text injection via `ClipPaste.exe`
- [ ] Implement "Smart Append" logic using `caretPosition` from the context
- [ ] Final A→B→C Pipeline integration
- [ ] Test: Verify text appears correctly in Notepad, Discord, and Browser

## Phase 5: Automation & Frontend
- [ ] Build the Main Settings window
- [ ] Implement System Tray integration (Minimize to Tray)
- [ ] Create `automation.js` framework for JSON-based action routing
- [ ] Implement "Action Templates" (e.g., "Correct my grammar", "Summarize this")

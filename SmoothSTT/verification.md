# SmoothSTT Coherence Verification (verification.md)
**Created:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Last Modified:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")

This document defines the strict "A→B→C" pipeline verification steps to ensure the project meets its original intent as it evolves.

---

## The Coherence Pipeline (A→B→C)

### Segment A: Capture & Intent
**Components:** `keyboard_hook.node`, `ContextReader.exe`, `Toast UI`
- **Objective:** Detect when the user wants to speak and identify exactly *where* they are typing.
- **Verification Step:**
    1. Hold the trigger key.
    2. Check if the Toast window appears within 100px of the text cursor.
    3. Check if `ContextReader.exe` returns a valid string and `caretPosition` > -1.

### Segment B: Processing & Intelligence
**Components:** `node-record-lpcm16`, `Whisper.cpp`, `stt-engine.js`
- **Objective:** Convert audio to high-accuracy text without using the internet.
- **Verification Step:**
    1. Speak a test phrase ("The quick brown fox").
    2. Check if the `stt-engine.js` output matches the phrase with >95% accuracy.
    3. Ensure CPU usage does not exceed 40% on a standard modern processor during inference.

### Segment C: Injection & Finality
**Components:** `ClipPaste.exe`, `automation.js`, `String Manipulation`
- **Objective:** Place the text in the target box and ensure it feels like "natural" typing.
- **Verification Step:**
    1. Release the trigger key.
    2. Verify the text appears exactly at the `caretPosition` identified in Segment A.
    3. Confirm the Toast window disappears immediately (<200ms) after injection.

---

## Failure Mode Analysis (A to C Drift)

| Potential Failure | Impact | Mitigation |
| :--- | :--- | :--- |
| Focus Loss during recording | Text injected into the wrong app | Cache the `HWND` (Window Handle) in Segment A; ignore injection if `HWND` changes in Segment C. |
| Context Scrape fails | User speaks but text is lost | Default to standard "Blind Paste" via `ClipPaste.exe` if specific context is unavailable. |
| Latency Spike in Segment B | User thinks the app crashed | Pulse the Toast UI to indicate "Processing..." state. |

## Change Traceability
Every Pull Request/Submit must answer:
1. Does this change affect the keyboard hook (A)?
2. Does it change how audio is processed (B)?
3. Does it change how text is injected (C)?
4. If yes to any, run the corresponding verification step.

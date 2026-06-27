# Third-Party Components and License Notes

## Included binaries
These ship inside the SmoothSTT installer.

## Current status
| Component | Path | License | Notes |
| --- | --- | --- | --- |
| `ClipPaste.exe` | `resources/native/goodpaste-win/ClipPaste.exe` | Unknown / unlicensed | Legacy binary. Replacement bridge `insert-bridge` is now active; commercial redistribution should still clear legacy license status before shipping. |
| `insert-bridge` | `resources/native/insert-bridge/` | MIT (clean-room) | Replaces legacy `ClipPaste.exe` text insertion functionality. |
| `context-reader` (new) | `resources/native/context-reader/` | MIT (clean-room) | Replaced legacy `ContextReader.exe`. |
| `native-sound-mixer` | `resources/native-sound-mixer/` | MIT | Safe to redistribute. |
| `uiohook-napi` | `resources/uiohook-napi/` | MIT | Safe to redistribute. |

## Previously bundled / now replaced
`ContextReader.exe` was shipped at `resources/@vidividivici/context-reader/bin/ContextReader.exe`. It is now fully replaced by the clean-room `context-reader` component above.

## Electron / Chromium
See `dist-installer/win-unpacked/LICENSE.electron.txt` and `LICENSES.chromium.html` after build.

## Practical guidance
- Do not publicly sell or redistribute SmoothSTT while it contains unlicensed binaries unless you obtain commercial permission from the upstream authors.
- Personal use, family use, and private testing are fine.
- If you want to monetize, prioritize replacing `ClipPaste.exe` before publishing commercially.

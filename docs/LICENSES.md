# Third-Party Components and License Notes

## Included binaries
These ship inside the SmoothSTT installer.

| Component | Path | License | Notes |
| --- | --- | --- | --- |
| `ContextReader.exe` | `resources/@vidividivici/context-reader/bin/ContextReader.exe` | Unknown / unlicensed | Upstream repo URL is in the package manifest; no LICENSE file found. |
| `ClipPaste.exe` | `resources/native/goodpaste-win/ClipPaste.exe` | Unknown / unlicensed | Same status as ContextReader. |
| `native-sound-mixer` | `resources/native-sound-mixer/` | MIT | Safe to redistribute. |
| `uiohook-napi` | `resources/uiohook-napi/` | MIT | Safe to redistribute. |

## Electron / Chromium
See `dist-installer/win-unpacked/LICENSE.electron.txt` and `LICENSES.chromium.html` after build.

## Practical guidance
- Do not publicly sell or redistribute SmoothSTT while it contains unlicensed binaries unless you obtain commercial permission from the upstream authors.
- Personal use, family use, and private testing are fine.
- If you want to monetize, the approved path is to replace or properly license `ContextReader.exe` and `ClipPaste.exe` before publishing commercially.

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class AutomationManager {
  constructor() {
    this.actions = [];
    this.pasteProc = null;
    this.pasteRequestId = 0;
    this.pasteResolveByRequestId = new Map();
  }

  processTranscription(text, context) {
    console.log(`Processing Transcription: ${text}`);
    return text;
  }

  _getClipPastePath() {
    const isWin = process.platform === 'win32';
    if (!isWin) return null;

    const candidates = [
      path.join(process.resourcesPath, 'resources', 'native', 'goodpaste-win', 'ClipPaste.exe'),
      path.join(process.resourcesPath, 'native', 'goodpaste-win', 'ClipPaste.exe'),
      path.join(__dirname, '..', '..', 'resources', 'native', 'goodpaste-win', 'ClipPaste.exe'),
      path.join(__dirname, '..', 'resources', 'native', 'goodpaste-win', 'ClipPaste.exe'),
    ];

    for (const p of candidates) {
      try {
        fs.accessSync(p, fs.constants.X_OK);
        return p;
      } catch {
        // Try next candidate
      }
    }
    return null;
  }

  _ensurePasteProcess() {
    if (this.pasteProc) return;

    const binaryPath = this._getClipPastePath();
    if (!binaryPath) {
      console.warn('[GoodPaste] ClipPaste.exe not found, skipping text insertion');
      return;
    }

    try {
      this.pasteProc = spawn(binaryPath, [], { stdio: ['pipe', 'pipe', 'pipe'] });
      this.pasteProc.stdout.on('data', (data) => {
        const text = data.toString();
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = JSON.parse(trimmed);
            if (event.event === 'pasted' && event.requestId != null) {
              const resolve = this.pasteResolveByRequestId.get(event.requestId);
              if (resolve) {
                this.pasteResolveByRequestId.delete(event.requestId);
                resolve({ ok: true, event });
              }
            }
          } catch {
            // ignore non-JSON stdout
          }
        }
      });

      this.pasteProc.stderr.on('data', (data) => {
        console.error('[GoodPaste] stderr:', data.toString().trim());
      });

      this.pasteProc.on('exit', (code) => {
        console.log('[GoodPaste] exited:', code);
        this.pasteProc = null;
        this.pasteResolveByRequestId.forEach((resolve) => resolve({ ok: false, error: 'process-exit' }));
        this.pasteResolveByRequestId.clear();
      });

      this.pasteProc.on('error', (err) => {
        console.error('[GoodPaste] spawn error:', err.message);
        this.pasteProc = null;
      });
    } catch (err) {
      console.error('[GoodPaste] failed to start:', err.message);
      this.pasteProc = null;
    }
  }

  async pasteText(text) {
    if (!text) return;

    const isWin = process.platform === 'win32';
    if (!isWin) {
      console.warn('[GoodPaste] pasteText is win32-only');
      return;
    }

    this._ensurePasteProcess();
    if (!this.pasteProc) return;

    const requestId = ++this.pasteRequestId;
    const command = JSON.stringify({
      action: 'paste',
      requestId,
      text,
      delayMs: 0,
      restoreMs: 1000,
      editTimeoutMs: 30000,
    });

    return new Promise((resolve) => {
      this.pasteResolveByRequestId.set(requestId, resolve);
      try {
        this.pasteProc.stdin.write(command + '\n');
      } catch (err) {
        this.pasteResolveByRequestId.delete(requestId);
        resolve({ ok: false, error: err.message });
      }
    });
  }
}

module.exports = new AutomationManager();

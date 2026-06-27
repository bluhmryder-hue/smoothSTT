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
    console.log(`Context: ${context ? JSON.stringify(context) : 'null'}`);
    return text;
  }

  _getClipPasteLegacyPath() {
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

  _getInsertBridgePath() {
    const isWin = process.platform === 'win32';
    if (!isWin) return null;

    const candidates = [
      path.join(process.resourcesPath, 'resources', 'native', 'insert-bridge', 'insert-bridge.exe'),
      path.join(process.resourcesPath, 'native', 'insert-bridge', 'insert-bridge.exe'),
      path.join(__dirname, '..', '..', 'resources', 'native', 'insert-bridge', 'insert-bridge.exe'),
      path.join(__dirname, '..', 'resources', 'native', 'insert-bridge', 'insert-bridge.exe'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p) || fs.accessSync(p, fs.constants.X_OK)) {
        return p;
      }
    }

    return null;
  }

  _ensurePasteProcess() {
    if (this.pasteProc) return;

    const legacyBinaryPath = this._getClipPasteLegacyPath();
    if (legacyBinaryPath) {
      return this._startProcess(legacyBinaryPath);
    }

    const insertBridgePath = this._getInsertBridgePath();
    if (insertBridgePath) {
      return this._startProcess(insertBridgePath);
    }

    console.warn('[GoodPaste] ClipPaste.exe and insert-bridge.exe not found; fallback clipboard will be used during paste');
    return;
  }

  _startProcess(binaryPath) {
    try {
      this.pasteProc = spawn(binaryPath, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (err) {
      console.error('[GoodPaste] failed to start:', err.message);
      this.pasteProc = null;
      return;
    }

    try {
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
    } catch (err) {
      console.error('[GoodPaste] stdout attach failed:', err.message);
    }

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
  }

  async _pasteViaClipboard(text) {
    try {
      const { clipboard } = require('electron');
      clipboard.writeText(text);
      console.log('[GoodPaste] wrote text to clipboard as fallback');
      return { ok: true, event: { fallback: true } };
    } catch (err) {
      console.error('[GoodPaste] fallback clipboard write failed:', err.message);
      return { ok: false, error: err.message };
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
    if (this.pasteProc) {
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

    return this._pasteViaClipboard(text);
  }
}

module.exports = new AutomationManager();

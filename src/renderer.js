const { ipcRenderer } = require('electron');

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

window.electron = {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (updates) => ipcRenderer.invoke('settings:set', updates),
  startTranscription: () => ipcRenderer.invoke('transcription:start'),
  stopTranscription: () => ipcRenderer.invoke('transcription:stop'),
  onStatus: (fn) => ipcRenderer.on('stt:status', (_, value) => fn(value)),
  onError: (fn) => ipcRenderer.on('stt:error', (_, value) => fn(value)),
  onTranscript: (fn) => ipcRenderer.on('transcript:result', (_, value) => fn(value)),
};

// Sidebar nav
$$('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    $$('.nav-item').forEach((n) => n.classList.remove('active'));
    $$('.panel').forEach((p) => p.classList.remove('active'));
    item.classList.add('active');
    const panel = document.getElementById('panel-' + item.dataset.panel);
    if (panel) panel.classList.add('active');
  });
});

// Start / Stop
const startBtn = $('#startBtn');
const stopBtn = $('#stopBtn');
const statusBadge = $('#statusBadge');
const transcriptEl = $('#transcript');
const eventLogEl = $('#eventLog');

function appendEvent(msg) {
  const line = new Date().toLocaleTimeString() + ' — ' + msg;
  eventLogEl.textContent = line + '\n' + eventLogEl.textContent;
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;
  setText(statusBadge, 'Recording');
  statusBadge.className = 'badge recording';
  appendEvent('Starting transcription...');
  try {
    await window.electron.startTranscription();
  } catch (e) {
    appendEvent('Start failed: ' + (e && e.message ? e.message : String(e)));
  }
});

stopBtn.addEventListener('click', async () => {
  try {
    await window.electron.stopTranscription();
  } catch (e) {
    appendEvent('Stop failed: ' + (e && e.message ? e.message : String(e)));
  }
});

window.electron.onStatus((s) => {
  setText(statusBadge, s);
  appendEvent('Status: ' + s);
  badgeClassFor(s);
  if (!s || s === 'Ready') {
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

function badgeClassFor(status) {
  const el = statusBadge;
  if (!el) return;
  const base = status || '';
  const lower = base.toLowerCase();
  if (lower.includes('error') || lower.includes('fail')) {
    el.className = 'badge status err';
  } else if (lower.includes('record')) {
    el.className = 'badge recording';
  } else if (lower.includes('starting')) {
    el.className = 'badge status warn';
  } else {
    el.className = 'badge status ok';
  }
}

window.electron.onError((e) => {
  appendEvent('Error: ' + e);
  setText(statusBadge, 'Error');
  startBtn.disabled = false;
  stopBtn.disabled = true;
  badgeClassFor('Error');
});

window.electron.onTranscript((t) => {
  setText(transcriptEl, t || 'No transcript yet.');
  appendEvent('Transcript updated.');
});

// Clipbord helpers
$('#copyBtn')?.addEventListener('click', async () => {
  const text = transcriptEl?.textContent || '';
  try {
    await navigator.clipboard.writeText(text);
    appendEvent('Copied to clipboard.');
  } catch (e) {
    appendEvent('Copy failed: ' + (e && e.message ? e.message : String(e)));
  }
});

$('#clearBtn')?.addEventListener('click', () => {
  setText(transcriptEl, 'No transcript yet.');
  appendEvent('Transcript cleared.');
});

// Settings
async function loadSettings() {
  const cfg = await window.electron.getSettings();
  if (!cfg) return;
  const endpoint = $('#endpointInput');
  const cli = $('#cliInput');
  const model = $('#modelInput');
  const triggerBadge = $('#triggerBadge');
  if (endpoint) endpoint.value = cfg.whisperEndpoint || '';
  if (cli) cli.value = cfg.whisperCli || '';
  if (model) model.value = cfg.whisperModelPath || '';
  if (triggerBadge) {
    setText(triggerBadge, cfg.triggerKeyCode != null ? String(cfg.triggerKeyCode) : 'Not set');
  }
  const autoPasteBtn = $('#toggleAutoPaste');
  if (autoPasteBtn) {
    setText(autoPasteBtn, 'Auto-paste: ' + (cfg.autoPaste ? 'On' : 'Off'));
  }
}

$('#saveEndpoint')?.addEventListener('click', async () => {
  const endpoint = $('#endpointInput')?.value || '';
  await window.electron.saveSettings({ whisperEndpoint: endpoint });
  appendEvent('Saved endpoint: ' + endpoint);
});

$('#saveCli')?.addEventListener('click', async () => {
  const cli = $('#cliInput')?.value || '';
  await window.electron.saveSettings({ whisperCli: cli });
  appendEvent('Saved CLI: ' + cli);
});

$('#saveModel')?.addEventListener('click', async () => {
  const model = $('#modelInput')?.value || '';
  await window.electron.saveSettings({ whisperModelPath: model });
  appendEvent('Saved model path.');
});

$('#changeTrigger')?.addEventListener('click', async () => {
  const { openTriggerPicker } = require('./renderer-trigger');
  const code = await openTriggerPicker();
  if (code != null) {
    await window.electron.saveSettings({ triggerKeyCode: code, firstRunComplete: true });
    const triggerBadge = $('#triggerBadge');
    if (triggerBadge) setText(triggerBadge, String(code));
    appendEvent('Saved trigger key: ' + code);
  }
});

$('#toggleAutoPaste')?.addEventListener('click', async () => {
  const cfg = await window.electron.getSettings();
  const next = !(cfg && cfg.autoPaste);
  await window.electron.saveSettings({ autoPaste: next });
  const btn = $('#toggleAutoPaste');
  if (btn) setText(btn, 'Auto-paste: ' + (next ? 'On' : 'Off'));
  appendEvent('Auto-paste: ' + (next ? 'On' : 'Off'));
});

loadSettings().catch((e) => appendEvent('Settings load failed.'));

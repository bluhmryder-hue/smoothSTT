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
  trimEventLog();
}

function trimEventLog() {
  if (!eventLogEl) return;
  const lines = eventLogEl.textContent.split('\n');
  const keep = Math.min(lines.length, 200);
  eventLogEl.textContent = lines.slice(0, keep).join('\n');
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

// Clipboard helpers
$('#copyBtn')?.addEventListener('click', async () => {
  const text = transcriptEl?.textContent || '';
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error('Clipboard API unavailable');
    }
    appendEvent('Copied to clipboard.');
  } catch (e) {
    appendEvent('Copy failed: ' + (e && e.message ? e.message : String(e)));
  }
});

$('#clearBtn')?.addEventListener('click', () => {
  setText(transcriptEl, 'No transcript yet.');
  appendEvent('Transcript cleared.');
});

// Settings helpers
const settingsIds = [
  'endpointInput',
  'cliInput',
  'modelInput',
  'modelFileNameInput',
  'whisperServerInput',
  'audioDeviceInput',
  'sampleRateInput',
  'channelsInput',
  'languageSelect',
  'themeSelect',
  'themeVariantSelect',
  'accentColorInput',
  'customPromptInput',
  'logLevelSelect',
  'maxLogLinesInput',
];

function valueFor(cfg, id) {
  const key = id.replace('Input', '').replace('Select', '');
  const map = {
    endpointInput: 'whisperEndpoint',
    cliInput: 'whisperCli',
    modelInput: 'whisperModelPath',
    modelFileNameInput: 'whisperModelFileName',
    whisperServerInput: 'whisperServerPath',
    audioDeviceInput: 'audioInputDevice',
    sampleRateInput: 'audioSampleRate',
    channelsInput: 'audioChannels',
    languageSelect: 'language',
    themeSelect: 'theme',
    themeVariantSelect: 'themeVariant',
    accentColorInput: 'accentColor',
    customPromptInput: 'customSystemPrompt',
    logLevelSelect: 'logLevel',
    maxLogLinesInput: 'maxLogLines',
  };
  if (key === 'sampleRate' || key === 'channels' || key === 'maxLogLines') {
    return cfg && cfg[map[id]] != null ? String(cfg[map[id]]) : '';
  }
  if (id.endsWith('Select')) {
    return cfg && cfg[map[id]] ? cfg[map[id]] : ($(id)?.value || '');
  }
  return cfg && cfg[map[id]] ? cfg[map[id]] : '';
}

async function loadSettings() {
  const cfg = await window.electron.getSettings();
  if (!cfg) return;
  settingsIds.forEach((id) => {
    const el = $(id);
    if (!el) return;
    if (id.endsWith('Select')) {
      el.value = String(valueFor(cfg, id));
      return;
    }
    el.value = valueFor(cfg, id);
  });
  updateToggleButtons(cfg);
  const triggerBadge = $('#triggerBadge');
  if (triggerBadge) {
    setText(triggerBadge, cfg.triggerKeyCode != null ? String(cfg.triggerKeyCode) : 'Not set');
  }
}

function updateToggleButtons(cfg) {
  const items = [
    { id: 'toggleAutoPaste', key: 'autoPaste', label: 'Auto-paste' },
    { id: 'toggleNotifications', key: 'showNotifications', label: 'Notifications' },
    { id: 'toggleStartup', key: 'runOnStartup', label: 'Run on startup' },
    { id: 'toggleTray', key: 'minimizeToTray', label: 'Minimize to tray' },
  ];
  items.forEach((item) => {
    const btn = $(item.id);
    if (!btn) return;
    const active = cfg && cfg[item.key];
    setText(btn, item.label + ': ' + (active ? 'On' : 'Off'));
  });
}

async function saveSetting(key, rawValue, label) {
  let value = rawValue;
  if (key === 'audioSampleRate' || key === 'audioChannels' || key === 'maxLogLines') {
    const num = Number(rawValue);
    value = Number.isFinite(num) ? num : null;
  }
  try {
    await window.electron.saveSettings({ [key]: value });
    appendEvent('Saved ' + label + ': ' + (value != null ? String(value) : ''));
  } catch (e) {
    appendEvent('Save failed for ' + label + ': ' + (e && e.message ? e.message : String(e)));
  }
}

async function toggleSetting(key, label, action) {
  const cfg = await window.electron.getSettings();
  const next = action(cfg && cfg[key]);
  await saveSetting(key, next, label);
}

$('#saveEndpoint')?.addEventListener('click', async () => {
  await saveSetting('whisperEndpoint', $('#endpointInput')?.value || '', 'endpoint');
});
$('#saveCli')?.addEventListener('click', async () => {
  await saveSetting('whisperCli', $('#cliInput')?.value || '', 'CLI');
});
$('#saveModel')?.addEventListener('click', async () => {
  await saveSetting('whisperModelPath', $('#modelInput')?.value || '', 'model path');
});
$('#saveModelFileName')?.addEventListener('click', async () => {
  await saveSetting('whisperModelFileName', $('#modelFileNameInput')?.value || '', 'model filename');
});
$('#saveWhisperServer')?.addEventListener('click', async () => {
  await saveSetting('whisperServerPath', $('#whisperServerInput')?.value || '', 'server path');
});
$('#saveAudioDevice')?.addEventListener('click', async () => {
  await saveSetting('audioInputDevice', $('#audioDeviceInput')?.value || '', 'audio device');
});
$('#saveSampleRate')?.addEventListener('click', async () => {
  await saveSetting('audioSampleRate', $('#sampleRateInput')?.value || '', 'sample rate');
});
$('#saveChannels')?.addEventListener('click', async () => {
  await saveSetting('audioChannels', $('#channelsInput')?.value || '', 'channels');
});
$('#saveLanguage')?.addEventListener('click', async () => {
  await saveSetting('language', $('#languageSelect')?.value || '', 'language');
});
$('#saveTheme')?.addEventListener('click', async () => {
  await saveSetting('theme', $('#themeSelect')?.value || '', 'theme');
});
$('#saveThemeVariant')?.addEventListener('click', async () => {
  await saveSetting('themeVariant', $('#themeVariantSelect')?.value || '', 'theme variant');
});
$('#saveAccentColor')?.addEventListener('click', async () => {
  await saveSetting('accentColor', $('#accentColorInput')?.value || '', 'accent color');
});
$('#saveCustomPrompt')?.addEventListener('click', async () => {
  await saveSetting('customSystemPrompt', $('#customPromptInput')?.value || '', 'custom prompt');
});
$('#saveLogLevel')?.addEventListener('click', async () => {
  await saveSetting('logLevel', $('#logLevelSelect')?.value || '', 'log level');
});
$('#saveMaxLogLines')?.addEventListener('click', async () => {
  await saveSetting('maxLogLines', $('#maxLogLinesInput')?.value || '', 'max log lines');
});

$('#toggleAutoPaste')?.addEventListener('click', async () => {
  await toggleSetting('autoPaste', 'auto-paste', (current) => !current);
});
$('#toggleNotifications')?.addEventListener('click', async () => {
  await toggleSetting('showNotifications', 'notifications', (current) => !current);
});
$('#toggleStartup')?.addEventListener('click', async () => {
  await toggleSetting('runOnStartup', 'run on startup', (current) => !current);
});
$('#toggleTray')?.addEventListener('click', async () => {
  await toggleSetting('minimizeToTray', 'minimize to tray', (current) => !current);
});

$('#resetDefaults')?.addEventListener('click', async () => {
  if (!confirm('Reset SmoothSTT settings to defaults?')) return;
  await window.electron.saveSettings({});
  await loadSettings();
  appendEvent('Settings reset to defaults.');
});

$('#exportConfig')?.addEventListener('click', async () => {
  try {
    const cfg = await window.electron.getSettings();
    if (!cfg) return;
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smoothstt-config.json';
    a.click();
    URL.revokeObjectURL(url);
    appendEvent('Exported config.');
  } catch (e) {
    appendEvent('Export failed: ' + (e && e.message ? e.message : String(e)));
  }
});

$('#importConfig')?.addEventListener('click', async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const cfg = JSON.parse(text);
      await window.electron.saveSettings(cfg);
      await loadSettings();
      appendEvent('Imported config.');
    } catch (e) {
      appendEvent('Import failed: ' + (e && e.message ? e.message : String(e)));
    }
  };
  input.click();
});

$('#changeTrigger')?.addEventListener('click', async () => {
  try {
    const openTriggerPicker = (() => {
      try {
        const mod = require('./renderer-trigger');
        if (mod && typeof mod.openTriggerPicker === 'function') return mod.openTriggerPicker;
      } catch (e) {
        // expected if trigger picker is missing
      }
      return null;
    })();

    if (!openTriggerPicker) {
      appendEvent('Trigger picker is not available yet.');
      return;
    }

    const code = await openTriggerPicker();
    if (code != null) {
      await window.electron.saveSettings({ triggerKeyCode: code, firstRunComplete: true });
      const triggerBadge = $('#triggerBadge');
      if (triggerBadge) setText(triggerBadge, String(code));
      appendEvent('Saved trigger key: ' + code);
    }
  } catch (e) {
    appendEvent('Trigger change failed: ' + (e && e.message ? e.message : String(e)));
  }
});

loadSettings().catch((e) => appendEvent('Settings load failed: ' + (e && e.message ? e.message : String(e))));

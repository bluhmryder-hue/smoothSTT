const { ipcRenderer } = require('electron');

window.electron = {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (updates) => ipcRenderer.invoke('settings:set', updates),
  startTranscription: () => ipcRenderer.invoke('transcription:start'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  showWindow: () => ipcRenderer.invoke('window:show'),
  onStatus: (fn) => ipcRenderer.on('stt:status', (_, value) => fn(value)),
  onError: (fn) => ipcRenderer.on('stt:error', (_, value) => fn(value)),
  onTranscript: (fn) => ipcRenderer.on('transcript:result', (_, value) => fn(value)),
  onToastStatus: (fn) => ipcRenderer.on('toast:status', (_, value) => fn(value)),
  onToastText: (fn) => ipcRenderer.on('toast:text', (_, value) => fn(value)),
  onToastError: (fn) => ipcRenderer.on('toast:error', (_, value) => fn(value)),
};

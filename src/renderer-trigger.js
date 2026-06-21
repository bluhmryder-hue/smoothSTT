const { ipcRenderer } = require('electron');

function openTriggerPicker() {
  return new Promise((resolve) => {
    const picker = new BrowserWindow({
      width: 420,
      height: 280,
      resizable: false,
      parent: BrowserWindow.getAllWindows()[0] || null,
      modal: true,
      backgroundColor: '#0b0f1a',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    picker.loadFile('setup.html');

    const handler = (_event, message) => {
      if (message && message.type === 'setup:complete') {
        ipcRenderer.removeListener('setup:message', handler);
        picker.close();
        resolve(message.key);
      }
    };

    ipcRenderer.on('setup:message', handler);

    picker.on('closed', () => {
      ipcRenderer.removeListener('setup:message', handler);
      resolve(null);
    });
  });
}

module.exports = { openTriggerPicker };

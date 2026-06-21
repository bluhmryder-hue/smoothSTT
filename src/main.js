const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

const STTEngine = require('./stt-engine');
const Automation = require('./automation');
const settings = require('./settings');

let mainWindow;
let toastWindow;
let tray;
let isRecording = false;
let currentConfig = settings.read();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 640,
    minWidth: 420,
    minHeight: 480,
    backgroundColor: '#0b1220',
    title: 'SmoothSTT',
    icon: path.join(__dirname, '..', 'fav.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createToast() {
  toastWindow = new BrowserWindow({
    width: 280,
    height: 56,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  toastWindow.loadFile(path.join(__dirname, 'toast.html'));
}

function buildTray() {
  tray = new Tray(path.join(__dirname, '..', 'fav.ico'));
  const menu = Menu.buildFromTemplate([
    { label: 'Open', click: () => mainWindow.show() },
    { label: 'Start dictation', click: () => startTranscription() },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } },
  ]);
  tray.setToolTip('SmoothSTT');
  tray.setContextMenu(menu);

  tray.on('double-click', () => {
    mainWindow.show();
  });
}

async function startTranscription() {
  if (isRecording) return;
  isRecording = true;
  mainWindow?.webContents.send('stt:status', 'Recording...');
  toastWindow?.webContents.send('toast:status', 'Recording');

  try {
    const context = ''; // Context reader integration point
    const transcript = await STTEngine.runPipeline();
    const processed = Automation.processTranscription(transcript, context);
    currentConfig.lastTranscript = processed;
    settings.write(currentConfig);
    mainWindow?.webContents.send('transcript:result', processed);
    toastWindow?.webContents.send('toast:text', processed);
    await Automation.pasteText(processed);
  } catch (error) {
    mainWindow?.webContents.send('stt:error', error.message);
    toastWindow?.webContents.send('toast:error', error.message);
  } finally {
    isRecording = false;
    mainWindow?.webContents.send('stt:status', 'Ready');
    toastWindow?.webContents.send('toast:status', 'Ready');
  }
}

function setupIpc() {
  ipcMain.handle('settings:get', () => currentConfig);
  ipcMain.handle('settings:set', (_, updates) => {
    currentConfig = { ...currentConfig, ...updates };
    settings.write(currentConfig);
    return currentConfig;
  });

  ipcMain.handle('transcription:start', async () => {
    await startTranscription();
  });

  ipcMain.handle('transcription:stop', () => {
    if (!isRecording) return;
    // Stop hook is implemented by engine state; UI polls status via events.
  });

  ipcMain.handle('window:close', () => {
    mainWindow.hide();
  });

  ipcMain.handle('window:show', () => {
    mainWindow.show();
  });

  ipcMain.on('setup:complete', () => {
    if (mainWindow) {
      mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }
  });
}

function openSetupIfNeeded() {
  if (currentConfig.firstRunComplete) return;
  if (!mainWindow) return;
  mainWindow.loadFile(path.join(__dirname, 'setup.html'));
}

app.whenReady().then(() => {
  createWindow();
  createToast();
  buildTray();
  setupIpc();
  openSetupIfNeeded();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

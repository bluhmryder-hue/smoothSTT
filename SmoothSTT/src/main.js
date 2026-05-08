/**
 * SmoothSTT Main Entry Point
 * Created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
 */
const { app, BrowserWindow, tray, Menu, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

let mainWindow;
let toastWindow;
let appTray;

function createWindows() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Toast Window (Frameless, Transparent, Topmost)
  toastWindow = new BrowserWindow({
    width: 200,
    height: 60,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Placeholder for window content
  // mainWindow.loadFile('src/index.html');
  // toastWindow.loadFile('src/toast.html');
}

app.whenReady().then(() => {
  createWindows();

  // Tray Integration
  appTray = new Tray(path.join(__dirname, '../resources/favicon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  appTray.setToolTip('SmoothSTT');
  appTray.setContextMenu(contextMenu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in tray
  }
});

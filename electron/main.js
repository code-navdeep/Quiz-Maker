const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { registerQuizHandlers } = require('./ipc/quizHandlers');
const { registerSettingsHandlers } = require('./ipc/settingsHandlers');
const { registerPdfHandlers } = require('./pdf/exportPdf');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // External links (target="_blank") open in the OS default browser, never in-app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  }
}

registerQuizHandlers(ipcMain);
registerSettingsHandlers(ipcMain);
registerPdfHandlers(ipcMain);

app.setAboutPanelOptions({
  applicationName: 'Quiz Maker',
  applicationVersion: app.getVersion(),
  version: app.getVersion(),
  copyright: '© 2026 Nav Virdi — Liberated.Info',
  credits: 'Nav Virdi\nLiberated.Info — https://liberated.info\nnav@Liberated.Info',
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const { createServer } = require('./server/app.cjs');

const API_HOST = '127.0.0.1';
const API_PORT = Number(process.env.STOIR_API_PORT || 3131);
const DEV_RENDERER_URL = process.env.ELECTRON_RENDERER_URL || 'http://localhost:3000';

let mainWindow;
let server;
let actualApiPort = API_PORT;

async function startServerWithFallback() {
  const maxAttempts = 20;
  let lastError;

  for (let i = 0; i <= maxAttempts; i += 1) {
    const portToTry = API_PORT + i;
    try {
      const instance = await createServer({
        host: API_HOST,
        port: portToTry,
        isPackaged: app.isPackaged,
        distDir: path.join(__dirname, '..', 'dist'),
        dataDir: app.getPath('userData'),
      });

      actualApiPort = portToTry;
      process.env.STOIR_API_PORT = String(actualApiPort);
      process.env.STOIR_API_BASE_URL = `http://${API_HOST}:${actualApiPort}/api`;
      return instance;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    await mainWindow.loadURL(`http://${API_HOST}:${API_PORT}/`);
  } else {
    await mainWindow.loadURL(DEV_RENDERER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(async () => {
  server = await startServerWithFallback();

  ipcMain.handle('stoir:restart', async () => {
    try {
      if (server) await server.close();
    } catch {
      // ignore
    }
    app.relaunch();
    app.exit(0);
  });

  await createMainWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  if (server) {
    try {
      await server.close();
    } catch {
      // ignore
    }
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

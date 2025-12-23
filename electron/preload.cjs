const { contextBridge, ipcRenderer } = require('electron');

const apiPort = Number(process.env.STOIR_API_PORT || 3131);
const apiBaseUrl = process.env.STOIR_API_BASE_URL || `http://127.0.0.1:${apiPort}/api`;

contextBridge.exposeInMainWorld('stoir', {
  apiBaseUrl,
  restartApp: () => ipcRenderer.invoke('stoir:restart'),
});

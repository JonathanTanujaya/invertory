const { contextBridge, ipcRenderer } = require("electron");

const apiPort = Number(process.env.STOIR_API_PORT || 3131);
const apiBaseUrl =
  process.env.STOIR_API_BASE_URL || `http://127.0.0.1:${apiPort}/api`;

contextBridge.exposeInMainWorld("stoir", {
  apiBaseUrl,
  restartApp: (opts) => ipcRenderer.invoke("stoir:restart", opts),
  // Listen for app closing event to trigger logout
  onAppClosing: (callback) => {
    ipcRenderer.on("stoir:app-closing", () => callback());
  },
  // Notify main process that logout is complete
  logoutComplete: () => ipcRenderer.send("stoir:logout-complete"),
});

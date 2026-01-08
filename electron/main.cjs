const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const { createServer } = require("./server/app.cjs");

const API_HOST = "127.0.0.1";
const API_PORT = Number(process.env.STOIR_API_PORT || 3131);
const DEV_RENDERER_URL =
  process.env.ELECTRON_RENDERER_URL || "http://localhost:3000";

function readRedirectArg(argv) {
  const arg = (argv || []).find(
    (a) => typeof a === "string" && a.startsWith("--stoir-redirect=")
  );
  if (!arg) return null;
  const value = String(arg.slice("--stoir-redirect=".length) || "").trim();
  if (!value) return null;
  return value.startsWith("/") ? value : `/${value}`;
}

let pendingRedirect = readRedirectArg(process.argv);

// In dev, avoid stale renderer due to Electron HTTP cache.
if (!app.isPackaged) {
  app.commandLine.appendSwitch("disable-http-cache");
}

let mainWindow;
let server;
let actualApiPort = API_PORT;
let isQuitting = false;

async function startServerOnPort(port) {
  const instance = await createServer({
    host: API_HOST,
    port,
    isPackaged: app.isPackaged,
    distDir: path.join(__dirname, "..", "dist"),
    dataDir: app.getPath("userData"),
  });

  actualApiPort = port;
  process.env.STOIR_API_PORT = String(actualApiPort);
  process.env.STOIR_API_BASE_URL = `http://${API_HOST}:${actualApiPort}/api`;
  return instance;
}

async function startServerWithFallback() {
  const maxAttempts = 20;
  let lastError;

  for (let i = 0; i <= maxAttempts; i += 1) {
    const portToTry = API_PORT + i;
    try {
      return await startServerOnPort(portToTry);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

async function softRestartDev(redirectTo) {
  // In dev, do NOT relaunch the process: electron:dev uses concurrently -k
  // which would kill Vite when Electron exits, causing a blank window.
  try {
    if (server) await server.close();
  } catch {
    // ignore
  }

  // Prefer the current port to keep renderer apiBaseUrl valid.
  try {
    server = await startServerOnPort(actualApiPort);
  } catch {
    server = await startServerWithFallback();
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      await mainWindow.webContents.session.clearCache();
    } catch {
      // ignore
    }
    try {
      const base = DEV_RENDERER_URL.replace(/\/$/, "");
      const pathPart = String(redirectTo || "/").startsWith("/")
        ? String(redirectTo || "/")
        : `/${redirectTo}`;
      await mainWindow.loadURL(`${base}${pathPart}`);
    } catch {
      // ignore
    }
    try {
      mainWindow.webContents.reloadIgnoringCache();
    } catch {
      // ignore
    }
  }
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    try {
      await mainWindow.webContents.session.clearCache();
    } catch {
      // ignore
    }
  }

  const startPath = pendingRedirect || "/";
  pendingRedirect = null;

  if (app.isPackaged) {
    await mainWindow.loadURL(`http://${API_HOST}:${actualApiPort}${startPath}`);
  } else {
    const base = DEV_RENDERER_URL.replace(/\/$/, "");
    await mainWindow.loadURL(`${base}${startPath}`);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(async () => {
  server = await startServerWithFallback();

  ipcMain.handle("stoir:restart", async (event, opts) => {
    const redirectTo =
      opts && typeof opts === "object" ? opts.redirectTo : null;

    if (!app.isPackaged) {
      await softRestartDev(redirectTo);
      return;
    }

    try {
      if (server) await server.close();
    } catch {
      // ignore
    }
    const keptArgs = process.argv
      .slice(1)
      .filter((a) => !String(a).startsWith("--stoir-redirect="));
    const extraArgs = redirectTo ? [`--stoir-redirect=${redirectTo}`] : [];
    app.relaunch({ args: keptArgs.concat(extraArgs) });
    app.exit(0);
  });

  await createMainWindow();

  // Handle logout complete signal from renderer
  ipcMain.on("stoir:logout-complete", () => {
    // Logout recorded, allow quit to proceed
  });

  // Handle window close - notify renderer to log out first
  mainWindow.on("close", (e) => {
    if (!isQuitting && mainWindow && !mainWindow.isDestroyed()) {
      e.preventDefault();
      isQuitting = true;
      // Notify renderer to perform logout
      mainWindow.webContents.send("stoir:app-closing");
      // Give renderer time to log out, then close
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.destroy();
        }
      }, 500);
    }
  });

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("window-all-closed", async () => {
  if (server) {
    try {
      await server.close();
    } catch {
      // ignore
    }
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

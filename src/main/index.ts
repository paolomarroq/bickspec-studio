import { app, BrowserWindow, Menu, ipcMain, nativeTheme } from "electron";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createBackendServices } from "./backend/createBackendServices";
import { registerBackendIpc } from "./backend/registerBackendIpc";
import { verifyRendererBridge } from "./backend/verifyRendererBridge";
import { verifyWorkspaceFlows } from "./backend/verifyWorkspaceFlows";

const isDev = Boolean(process.env.ELECTRON_RENDERER_URL);
const appIconPath = isDev
  ? join(app.getAppPath(), "src/assets/brand/icon.png")
  : join(process.resourcesPath, "icon.png");

function createWindow(preloadPath: string): void {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 720,
    title: "BickSpec Studio",
    icon: appIconPath,
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0e1513" : "#f5faff",
    show: false,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

function resolvePreloadPath(): string {
  const candidates = [join(__dirname, "../preload/index.mjs"), join(__dirname, "../preload/index.js")];
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  const backendServices = createBackendServices(app, app.getAppPath());
  const preloadPath = resolvePreloadPath();
  if (process.env.BICKSPEC_VERIFY_WORKSPACE_FLOWS === "1") {
    void verifyWorkspaceFlows(backendServices)
      .then(() => app.quit())
      .catch((error: unknown) => {
        console.error(error);
        app.exit(1);
      });
    return;
  }
  registerBackendIpc(backendServices);
  ipcMain.handle("app:get-version", () => app.getVersion());
  if (process.env.BICKSPEC_VERIFY_RENDERER_BRIDGE === "1") {
    void verifyRendererBridge(app, preloadPath)
      .then(() => app.quit())
      .catch((error: unknown) => {
        console.error(error);
        app.exit(1);
      });
    return;
  }
  createWindow(preloadPath);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(preloadPath);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

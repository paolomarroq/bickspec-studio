import { app, BrowserWindow, Menu, ipcMain, nativeTheme } from "electron";
import { join } from "node:path";
import { createBackendServices } from "./backend/createBackendServices";
import { registerBackendIpc } from "./backend/registerBackendIpc";
import { verifyWorkspaceFlows } from "./backend/verifyWorkspaceFlows";

const isDev = Boolean(process.env.ELECTRON_RENDERER_URL);
const appIconPath = isDev
  ? join(app.getAppPath(), "src/assets/brand/icon.png")
  : join(process.resourcesPath, "icon.png");

function createWindow(): void {
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
      preload: join(__dirname, "../preload/index.js"),
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

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  const backendServices = createBackendServices(app, app.getAppPath());
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
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

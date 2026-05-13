import { BrowserWindow, type App } from "electron";

export async function verifyRendererBridge(_app: App, preloadPath: string): Promise<void> {
  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  try {
    await window.loadURL("data:text/html,<html><body>BickSpec Studio bridge verification</body></html>");
    const result = (await window.webContents.executeJavaScript(`
      Boolean(
        window.bickspecStudio &&
        window.bickspecStudio.app &&
        window.bickspecStudio.backend &&
        typeof window.bickspecStudio.backend.createNewBickSpecFile === "function" &&
        typeof window.bickspecStudio.backend.chooseAndOpenBickSpecFile === "function" &&
        typeof window.bickspecStudio.backend.chooseAndOpenWorkspaceFolder === "function" &&
        typeof window.bickspecStudio.backend.saveWorkspaceFile === "function" &&
        typeof window.bickspecStudio.backend.openWorkspaceFile === "function"
      )
    `)) as boolean;

    if (!result) throw new Error(`Renderer bridge verification failed for preload: ${preloadPath}`);
    console.log(`BickSpec Studio renderer bridge verification passed: ${preloadPath}`);
  } finally {
    window.destroy();
  }
}

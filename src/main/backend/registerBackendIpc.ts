import { ipcMain } from "electron";
import type { BackendServices } from "./createBackendServices";

export function registerBackendIpc(backend: BackendServices): void {
  ipcMain.handle("backend:get-status", () => backend.compilerBridge.getBackendStatus());
  ipcMain.handle("backend:get-linked-compiler-config", () => backend.compilerBridge.getLinkedCompilerConfig());
  ipcMain.handle("backend:set-linked-compiler-path", (_event, repositoryPath: string) => {
    return backend.settings.setLinkedCompilerPath(repositoryPath);
  });
  ipcMain.handle("backend:validate-compiler-repository", (_event, repositoryPath: string) => {
    return backend.compilerBridge.validateCompilerRepository(repositoryPath);
  });
  ipcMain.handle("backend:get-workspace-info", () => backend.workspace.getWorkspaceInfo());
}


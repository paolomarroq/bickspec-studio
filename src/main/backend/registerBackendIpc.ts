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
  ipcMain.handle("backend:run-bickspec-file", (_event, filePath: string) => {
    return backend.compilerExecution.runCurrentFile(filePath);
  });
  ipcMain.handle("backend:run-bickspec-directory", (_event, directoryPath: string) => {
    return backend.compilerExecution.compileDirectory(directoryPath);
  });
  ipcMain.handle("backend:execute-compiler-target", (_event, targetPath: string) => {
    return backend.compilerExecution.executeCompilerTarget({ targetPath, targetKind: "target" });
  });
  ipcMain.handle("backend:get-compiler-execution-status", () => backend.compilerExecution.getStatus());
  ipcMain.handle("backend:get-last-execution-result", () => backend.compilerExecution.getLastResult());
  ipcMain.handle("backend:get-resolved-compiler-artifact", () => backend.compilerExecution.getResolvedCompilerArtifact());
  ipcMain.handle("backend:parse-compiler-output", (_event, rawOutput: string) => {
    return backend.compilerExecution.parseCompilerOutput(rawOutput);
  });
}

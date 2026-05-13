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
  ipcMain.handle("backend:get-last-compiler-session", () => backend.compilerExecution.getLastSession());
  ipcMain.handle("backend:get-last-diagnostics", () => backend.compilerExecution.getLastDiagnostics());
  ipcMain.handle("backend:get-last-artifacts", () => backend.compilerExecution.getLastArtifacts());
  ipcMain.handle("backend:open-artifact-path", (_event, artifactPath: string) => {
    return backend.compilerExecution.openArtifactPath(artifactPath);
  });
  ipcMain.handle("backend:reveal-artifact-in-folder", (_event, artifactPath: string) => {
    return backend.compilerExecution.revealArtifactInFolder(artifactPath);
  });
  ipcMain.handle("backend:read-artifact-text", (_event, artifactPath: string) => {
    return backend.compilerExecution.readArtifactText(artifactPath);
  });
  ipcMain.handle("backend:get-artifact-preview-data", (_event, artifactPath: string) => {
    return backend.compilerExecution.getArtifactPreviewData(artifactPath);
  });
  ipcMain.handle("backend:get-compiler-console-output", () => backend.compilerExecution.getCompilerConsoleOutput());
  ipcMain.handle("backend:clear-last-compiler-session", () => backend.compilerExecution.clearLastSession());
  ipcMain.handle("backend:get-studio-workspace-state", () => backend.appWorkspace.getWorkspaceState());
  ipcMain.handle("backend:create-new-bickspec-file", () => backend.appWorkspace.createNewBickSpecFile());
  ipcMain.handle("backend:choose-and-open-bickspec-file", () => backend.appWorkspace.chooseAndOpenBickSpecFile());
  ipcMain.handle("backend:choose-and-open-workspace-folder", () => backend.appWorkspace.chooseAndOpenWorkspaceFolder());
  ipcMain.handle("backend:reopen-recent-entry", (_event, entryPath: string) => backend.appWorkspace.reopenRecentEntry(entryPath));
  ipcMain.handle("backend:open-workspace-file", (_event, filePath: string) => backend.appWorkspace.openWorkspaceFile(filePath));
  ipcMain.handle("backend:save-workspace-file", (_event, request) => backend.appWorkspace.saveWorkspaceFile(request));
  ipcMain.handle("backend:list-workspace-files", (_event, folderPath: string) => backend.appWorkspace.listWorkspaceFiles(folderPath));
  ipcMain.handle("backend:get-recent-workspace-entries", () => backend.appWorkspace.getRecentWorkspaceEntries());
  ipcMain.handle("backend:open-documentation", () => backend.appWorkspace.openDocumentation());
  ipcMain.handle("backend:open-output-folder", (_event, folderPath: string) => backend.appWorkspace.openOutputFolder(folderPath));
  ipcMain.handle("backend:export-artifact", (_event, artifactPath: string) => backend.appWorkspace.exportArtifact(artifactPath));
}

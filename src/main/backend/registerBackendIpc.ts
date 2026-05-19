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
  ipcMain.handle("backend:get-interactive-session-state", () => backend.compilerExecution.getInteractiveSessionState());
  ipcMain.handle("backend:send-interactive-input", (_event, input: string) => backend.compilerExecution.sendInteractiveInput(input));
  ipcMain.handle("backend:reset-interactive-session", () => backend.compilerExecution.resetInteractiveSession());
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
  ipcMain.handle("backend:export-report", (_event, report, format) => backend.reportExport.export(report, format));
  ipcMain.handle("setup:get-state", () => backend.setupWizard.getState());
  ipcMain.handle("setup:save-state", (_event, patch) => backend.setupWizard.saveState(patch));
  ipcMain.handle("setup:reset", () => backend.setupWizard.reset());
  ipcMain.handle("setup:skip", () => backend.setupWizard.skip());
  ipcMain.handle("setup:finish", () => backend.setupWizard.finish());
  ipcMain.handle("setup:validate-java", (_event, javaPath?: string) => backend.setupWizard.validateJava(javaPath));
  ipcMain.handle("setup:install-java", () => backend.setupWizard.installJava());
  ipcMain.handle("setup:select-java", () => backend.setupWizard.selectJava());
  ipcMain.handle("setup:select-compiler-repo", () => backend.setupWizard.selectCompilerRepo());
  ipcMain.handle("setup:validate-compiler-repo", (_event, repositoryPath?: string) => backend.setupWizard.validateCompilerRepo(repositoryPath));
  ipcMain.handle("setup:validate-git", () => backend.setupWizard.validateGit());
  ipcMain.handle("setup:get-configured-repo-url", () => backend.setupWizard.getConfiguredRepoUrl());
  ipcMain.handle("setup:clone-compiler-repo", () => backend.setupWizard.cloneCompilerRepo());
  ipcMain.handle("setup:update-compiler-repo", () => backend.setupWizard.updateCompilerRepo());
  ipcMain.handle("setup:select-compiler-jar", () => backend.setupWizard.selectCompilerJar());
  ipcMain.handle("setup:validate-compiler-jar", (_event, jarPath?: string) => backend.setupWizard.validateCompilerJar(jarPath));
  ipcMain.handle("setup:build-compiler-from-repo", () => backend.setupWizard.buildCompilerFromRepo());
  ipcMain.handle("setup:select-workspace", () => backend.setupWizard.selectWorkspace());
  ipcMain.handle("setup:validate-workspace", (_event, workspacePath?: string) => backend.setupWizard.validateWorkspace(workspacePath));
  ipcMain.handle("setup:run-compilation-test", () => backend.setupWizard.runCompilationTest());
  ipcMain.handle("setup:run-interactive-test", () => backend.setupWizard.runInteractiveTest());
  ipcMain.handle("setup:validate-artifacts", () => backend.setupWizard.validateArtifacts());
  ipcMain.handle("setup:test-report-export", () => backend.setupWizard.testReportExport());
}

import { clipboard, contextBridge, ipcRenderer } from "electron";
import type { StudioBridge } from "@shared/contracts/bridge";

const bridge: StudioBridge = {
  app: {
    getVersion: () => ipcRenderer.invoke("app:get-version") as Promise<string>,
    readClipboardText: () => Promise.resolve(clipboard.readText()),
    writeClipboardText: (text) => {
      clipboard.writeText(text);
      return Promise.resolve();
    }
  },
  backend: {
    getBackendStatus: () => ipcRenderer.invoke("backend:get-status") as ReturnType<StudioBridge["backend"]["getBackendStatus"]>,
    getLinkedCompilerConfig: () => ipcRenderer.invoke("backend:get-linked-compiler-config") as ReturnType<StudioBridge["backend"]["getLinkedCompilerConfig"]>,
    setLinkedCompilerPath: (repositoryPath) =>
      ipcRenderer.invoke("backend:set-linked-compiler-path", repositoryPath) as ReturnType<StudioBridge["backend"]["setLinkedCompilerPath"]>,
    validateCompilerRepository: (repositoryPath) =>
      ipcRenderer.invoke("backend:validate-compiler-repository", repositoryPath) as ReturnType<StudioBridge["backend"]["validateCompilerRepository"]>,
    getWorkspaceInfo: () => ipcRenderer.invoke("backend:get-workspace-info") as ReturnType<StudioBridge["backend"]["getWorkspaceInfo"]>,
    runBickSpecFile: (filePath) =>
      ipcRenderer.invoke("backend:run-bickspec-file", filePath) as ReturnType<StudioBridge["backend"]["runBickSpecFile"]>,
    runBickSpecDirectory: (directoryPath) =>
      ipcRenderer.invoke("backend:run-bickspec-directory", directoryPath) as ReturnType<StudioBridge["backend"]["runBickSpecDirectory"]>,
    executeCompilerTarget: (targetPath) =>
      ipcRenderer.invoke("backend:execute-compiler-target", targetPath) as ReturnType<StudioBridge["backend"]["executeCompilerTarget"]>,
    getCompilerExecutionStatus: () =>
      ipcRenderer.invoke("backend:get-compiler-execution-status") as ReturnType<StudioBridge["backend"]["getCompilerExecutionStatus"]>,
    getLastExecutionResult: () =>
      ipcRenderer.invoke("backend:get-last-execution-result") as ReturnType<StudioBridge["backend"]["getLastExecutionResult"]>,
    getResolvedCompilerArtifact: () =>
      ipcRenderer.invoke("backend:get-resolved-compiler-artifact") as ReturnType<StudioBridge["backend"]["getResolvedCompilerArtifact"]>,
    parseCompilerOutput: (rawOutput) =>
      ipcRenderer.invoke("backend:parse-compiler-output", rawOutput) as ReturnType<StudioBridge["backend"]["parseCompilerOutput"]>,
    getLastCompilerSession: () =>
      ipcRenderer.invoke("backend:get-last-compiler-session") as ReturnType<StudioBridge["backend"]["getLastCompilerSession"]>,
    getLastDiagnostics: () =>
      ipcRenderer.invoke("backend:get-last-diagnostics") as ReturnType<StudioBridge["backend"]["getLastDiagnostics"]>,
    getLastArtifacts: () =>
      ipcRenderer.invoke("backend:get-last-artifacts") as ReturnType<StudioBridge["backend"]["getLastArtifacts"]>,
    openArtifactPath: (artifactPath) =>
      ipcRenderer.invoke("backend:open-artifact-path", artifactPath) as ReturnType<StudioBridge["backend"]["openArtifactPath"]>,
    revealArtifactInFolder: (artifactPath) =>
      ipcRenderer.invoke("backend:reveal-artifact-in-folder", artifactPath) as ReturnType<StudioBridge["backend"]["revealArtifactInFolder"]>,
    readArtifactText: (artifactPath) =>
      ipcRenderer.invoke("backend:read-artifact-text", artifactPath) as ReturnType<StudioBridge["backend"]["readArtifactText"]>,
    getArtifactPreviewData: (artifactPath) =>
      ipcRenderer.invoke("backend:get-artifact-preview-data", artifactPath) as ReturnType<StudioBridge["backend"]["getArtifactPreviewData"]>,
    getCompilerConsoleOutput: () =>
      ipcRenderer.invoke("backend:get-compiler-console-output") as ReturnType<StudioBridge["backend"]["getCompilerConsoleOutput"]>,
    clearLastCompilerSession: () =>
      ipcRenderer.invoke("backend:clear-last-compiler-session") as ReturnType<StudioBridge["backend"]["clearLastCompilerSession"]>,
    getStudioWorkspaceState: () =>
      ipcRenderer.invoke("backend:get-studio-workspace-state") as ReturnType<StudioBridge["backend"]["getStudioWorkspaceState"]>,
    createNewBickSpecFile: () =>
      ipcRenderer.invoke("backend:create-new-bickspec-file") as ReturnType<StudioBridge["backend"]["createNewBickSpecFile"]>,
    chooseAndOpenBickSpecFile: () =>
      ipcRenderer.invoke("backend:choose-and-open-bickspec-file") as ReturnType<StudioBridge["backend"]["chooseAndOpenBickSpecFile"]>,
    chooseAndOpenWorkspaceFolder: () =>
      ipcRenderer.invoke("backend:choose-and-open-workspace-folder") as ReturnType<StudioBridge["backend"]["chooseAndOpenWorkspaceFolder"]>,
    reopenRecentEntry: (entryPath) =>
      ipcRenderer.invoke("backend:reopen-recent-entry", entryPath) as ReturnType<StudioBridge["backend"]["reopenRecentEntry"]>,
    openWorkspaceFile: (filePath) =>
      ipcRenderer.invoke("backend:open-workspace-file", filePath) as ReturnType<StudioBridge["backend"]["openWorkspaceFile"]>,
    saveWorkspaceFile: (request) =>
      ipcRenderer.invoke("backend:save-workspace-file", request) as ReturnType<StudioBridge["backend"]["saveWorkspaceFile"]>,
    listWorkspaceFiles: (folderPath) =>
      ipcRenderer.invoke("backend:list-workspace-files", folderPath) as ReturnType<StudioBridge["backend"]["listWorkspaceFiles"]>,
    getRecentWorkspaceEntries: () =>
      ipcRenderer.invoke("backend:get-recent-workspace-entries") as ReturnType<StudioBridge["backend"]["getRecentWorkspaceEntries"]>,
    openDocumentation: () =>
      ipcRenderer.invoke("backend:open-documentation") as ReturnType<StudioBridge["backend"]["openDocumentation"]>,
    openOutputFolder: (folderPath) =>
      ipcRenderer.invoke("backend:open-output-folder", folderPath) as ReturnType<StudioBridge["backend"]["openOutputFolder"]>,
    exportArtifact: (artifactPath) =>
      ipcRenderer.invoke("backend:export-artifact", artifactPath) as ReturnType<StudioBridge["backend"]["exportArtifact"]>
  }
};

contextBridge.exposeInMainWorld("bickspecStudio", bridge);

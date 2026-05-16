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
    getInteractiveSessionState: () =>
      ipcRenderer.invoke("backend:get-interactive-session-state") as ReturnType<StudioBridge["backend"]["getInteractiveSessionState"]>,
    sendInteractiveInput: (input) =>
      ipcRenderer.invoke("backend:send-interactive-input", input) as ReturnType<StudioBridge["backend"]["sendInteractiveInput"]>,
    resetInteractiveSession: () =>
      ipcRenderer.invoke("backend:reset-interactive-session") as ReturnType<StudioBridge["backend"]["resetInteractiveSession"]>,
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
      ipcRenderer.invoke("backend:export-artifact", artifactPath) as ReturnType<StudioBridge["backend"]["exportArtifact"]>,
    exportReport: (report, format) =>
      ipcRenderer.invoke("backend:export-report", report, format) as ReturnType<StudioBridge["backend"]["exportReport"]>,
    getSetupState: () => ipcRenderer.invoke("setup:get-state") as ReturnType<StudioBridge["backend"]["getSetupState"]>,
    saveSetupState: (patch) => ipcRenderer.invoke("setup:save-state", patch) as ReturnType<StudioBridge["backend"]["saveSetupState"]>,
    resetSetup: () => ipcRenderer.invoke("setup:reset") as ReturnType<StudioBridge["backend"]["resetSetup"]>,
    skipSetup: () => ipcRenderer.invoke("setup:skip") as ReturnType<StudioBridge["backend"]["skipSetup"]>,
    finishSetup: () => ipcRenderer.invoke("setup:finish") as ReturnType<StudioBridge["backend"]["finishSetup"]>,
    validateJava: (javaPath) => ipcRenderer.invoke("setup:validate-java", javaPath) as ReturnType<StudioBridge["backend"]["validateJava"]>,
    selectJava: () => ipcRenderer.invoke("setup:select-java") as ReturnType<StudioBridge["backend"]["selectJava"]>,
    selectCompilerRepo: () => ipcRenderer.invoke("setup:select-compiler-repo") as ReturnType<StudioBridge["backend"]["selectCompilerRepo"]>,
    validateCompilerRepo: (repositoryPath) =>
      ipcRenderer.invoke("setup:validate-compiler-repo", repositoryPath) as ReturnType<StudioBridge["backend"]["validateCompilerRepo"]>,
    validateGit: () => ipcRenderer.invoke("setup:validate-git") as ReturnType<StudioBridge["backend"]["validateGit"]>,
    getConfiguredRepoUrl: () =>
      ipcRenderer.invoke("setup:get-configured-repo-url") as ReturnType<StudioBridge["backend"]["getConfiguredRepoUrl"]>,
    cloneCompilerRepo: () =>
      ipcRenderer.invoke("setup:clone-compiler-repo") as ReturnType<StudioBridge["backend"]["cloneCompilerRepo"]>,
    updateCompilerRepo: () =>
      ipcRenderer.invoke("setup:update-compiler-repo") as ReturnType<StudioBridge["backend"]["updateCompilerRepo"]>,
    selectCompilerJar: () => ipcRenderer.invoke("setup:select-compiler-jar") as ReturnType<StudioBridge["backend"]["selectCompilerJar"]>,
    validateCompilerJar: (jarPath) =>
      ipcRenderer.invoke("setup:validate-compiler-jar", jarPath) as ReturnType<StudioBridge["backend"]["validateCompilerJar"]>,
    buildCompilerFromRepo: () =>
      ipcRenderer.invoke("setup:build-compiler-from-repo") as ReturnType<StudioBridge["backend"]["buildCompilerFromRepo"]>,
    selectWorkspace: () => ipcRenderer.invoke("setup:select-workspace") as ReturnType<StudioBridge["backend"]["selectWorkspace"]>,
    validateWorkspace: (workspacePath) =>
      ipcRenderer.invoke("setup:validate-workspace", workspacePath) as ReturnType<StudioBridge["backend"]["validateWorkspace"]>,
    runSetupCompilationTest: () =>
      ipcRenderer.invoke("setup:run-compilation-test") as ReturnType<StudioBridge["backend"]["runSetupCompilationTest"]>,
    runSetupInteractiveTest: () =>
      ipcRenderer.invoke("setup:run-interactive-test") as ReturnType<StudioBridge["backend"]["runSetupInteractiveTest"]>,
    validateSetupArtifacts: () =>
      ipcRenderer.invoke("setup:validate-artifacts") as ReturnType<StudioBridge["backend"]["validateSetupArtifacts"]>,
    testSetupReportExport: () =>
      ipcRenderer.invoke("setup:test-report-export") as ReturnType<StudioBridge["backend"]["testSetupReportExport"]>
  }
};

contextBridge.exposeInMainWorld("bickspecStudio", bridge);

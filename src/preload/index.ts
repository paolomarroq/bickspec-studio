import { contextBridge, ipcRenderer } from "electron";
import type { StudioBridge } from "@shared/contracts/bridge";

const bridge: StudioBridge = {
  app: {
    getVersion: () => ipcRenderer.invoke("app:get-version") as Promise<string>
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
      ipcRenderer.invoke("backend:parse-compiler-output", rawOutput) as ReturnType<StudioBridge["backend"]["parseCompilerOutput"]>
  }
};

contextBridge.exposeInMainWorld("bickspecStudio", bridge);

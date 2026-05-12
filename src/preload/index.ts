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
    getWorkspaceInfo: () => ipcRenderer.invoke("backend:get-workspace-info") as ReturnType<StudioBridge["backend"]["getWorkspaceInfo"]>
  }
};

contextBridge.exposeInMainWorld("bickspecStudio", bridge);

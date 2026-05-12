import type {
  BackendSettings,
  BackendStatus,
  CompilerRepositoryConfig,
  CompilerRepositoryValidation,
  WorkspaceInfo
} from "./backend";

export interface StudioBridge {
  app: {
    getVersion(): Promise<string>;
  };
  backend: {
    getBackendStatus(): Promise<BackendStatus>;
    getLinkedCompilerConfig(): Promise<CompilerRepositoryConfig>;
    setLinkedCompilerPath(repositoryPath: string): Promise<BackendSettings>;
    validateCompilerRepository(repositoryPath: string): Promise<CompilerRepositoryValidation>;
    getWorkspaceInfo(): Promise<WorkspaceInfo>;
  };
}

declare global {
  interface Window {
    bickspecStudio?: StudioBridge;
  }
}

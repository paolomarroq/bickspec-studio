import type {
  BackendSettings,
  BackendStatus,
  CompilerArtifactResolution,
  CompilerExecutionResult,
  CompilerExecutionStatus,
  CompilerRepositoryConfig,
  CompilerRepositoryValidation,
  ParsedCompilerOutput,
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
    runBickSpecFile(filePath: string): Promise<CompilerExecutionResult>;
    runBickSpecDirectory(directoryPath: string): Promise<CompilerExecutionResult>;
    executeCompilerTarget(targetPath: string): Promise<CompilerExecutionResult>;
    getCompilerExecutionStatus(): Promise<CompilerExecutionStatus>;
    getLastExecutionResult(): Promise<CompilerExecutionResult | null>;
    getResolvedCompilerArtifact(): Promise<CompilerArtifactResolution>;
    parseCompilerOutput(rawOutput: string): Promise<ParsedCompilerOutput>;
  };
}

declare global {
  interface Window {
    bickspecStudio?: StudioBridge;
  }
}

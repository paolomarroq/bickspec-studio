import type {
  BackendSettings,
  BackendStatus,
  CompilerArtifactResolution,
  ArtifactPreviewData,
  CompilerDiagnostic,
  CompilerExecutionResult,
  CompilerExecutionStatus,
  CompilerSessionResult,
  GeneratedArtifactMetadata,
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
    getLastCompilerSession(): Promise<CompilerSessionResult | null>;
    getLastDiagnostics(): Promise<CompilerDiagnostic[]>;
    getLastArtifacts(): Promise<GeneratedArtifactMetadata[]>;
    openArtifactPath(artifactPath: string): Promise<void>;
    revealArtifactInFolder(artifactPath: string): Promise<void>;
    readArtifactText(artifactPath: string): Promise<string>;
    getArtifactPreviewData(artifactPath: string): Promise<ArtifactPreviewData>;
    getCompilerConsoleOutput(): Promise<string>;
    clearLastCompilerSession(): Promise<void>;
  };
}

declare global {
  interface Window {
    bickspecStudio?: StudioBridge;
  }
}

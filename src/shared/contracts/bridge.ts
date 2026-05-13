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
  OpenFileResult,
  OpenWorkspaceFile,
  CompilerRepositoryConfig,
  CompilerRepositoryValidation,
  ParsedCompilerOutput,
  RecentWorkspaceEntry,
  SaveFileRequest,
  StudioWorkspaceState,
  WorkspaceInfo
} from "./backend";

export interface StudioBridge {
  app: {
    getVersion(): Promise<string>;
    readClipboardText(): Promise<string>;
    writeClipboardText(text: string): Promise<void>;
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
    getStudioWorkspaceState(): Promise<StudioWorkspaceState>;
    createNewBickSpecFile(): Promise<OpenFileResult | null>;
    chooseAndOpenBickSpecFile(): Promise<OpenFileResult | null>;
    chooseAndOpenWorkspaceFolder(): Promise<StudioWorkspaceState | null>;
    reopenRecentEntry(entryPath: string): Promise<OpenFileResult | StudioWorkspaceState | null>;
    openWorkspaceFile(filePath: string): Promise<OpenFileResult>;
    saveWorkspaceFile(request: SaveFileRequest): Promise<OpenWorkspaceFile>;
    listWorkspaceFiles(folderPath: string): Promise<StudioWorkspaceState>;
    getRecentWorkspaceEntries(): Promise<RecentWorkspaceEntry[]>;
    openDocumentation(): Promise<void>;
    openOutputFolder(folderPath: string): Promise<void>;
    exportArtifact(artifactPath: string): Promise<string | null>;
  };
}

declare global {
  interface Window {
    bickspecStudio?: StudioBridge;
  }
}

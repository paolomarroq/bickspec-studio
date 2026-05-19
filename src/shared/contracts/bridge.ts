import type {
  BackendSettings,
  BackendStatus,
  CompilerArtifactResolution,
  JavaInstallResult,
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
  InteractiveSessionState,
  RecentWorkspaceEntry,
  SaveFileRequest,
  StudioWorkspaceState,
  WorkspaceInfo,
  SetupState,
  SetupValidationResult
} from "./backend";
import type { BickSpecReportData, ReportExportFormat } from "./reports";
import type { SetupCompilationResult, SetupInteractiveResult } from "./setup";

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
    getInteractiveSessionState(): Promise<InteractiveSessionState>;
    sendInteractiveInput(input: string): Promise<boolean>;
    resetInteractiveSession(): Promise<InteractiveSessionState>;
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
    exportReport(report: BickSpecReportData, format: ReportExportFormat): Promise<string | null>;
    getSetupState(): Promise<SetupState>;
    saveSetupState(patch: Partial<SetupState>): Promise<SetupState>;
    resetSetup(): Promise<SetupState>;
    skipSetup(): Promise<SetupState>;
    finishSetup(): Promise<SetupState>;
    validateJava(javaPath?: string): Promise<SetupValidationResult>;
    installJava(): Promise<JavaInstallResult>;
    selectJava(): Promise<string | null>;
    selectCompilerRepo(): Promise<string | null>;
    validateCompilerRepo(repositoryPath?: string): Promise<SetupValidationResult>;
    validateGit(): Promise<SetupValidationResult>;
    getConfiguredRepoUrl(): Promise<string>;
    cloneCompilerRepo(): Promise<SetupValidationResult>;
    updateCompilerRepo(): Promise<SetupValidationResult>;
    selectCompilerJar(): Promise<string | null>;
    validateCompilerJar(jarPath?: string): Promise<SetupValidationResult>;
    buildCompilerFromRepo(): Promise<SetupValidationResult>;
    selectWorkspace(): Promise<string | null>;
    validateWorkspace(workspacePath?: string): Promise<SetupValidationResult>;
    runSetupCompilationTest(): Promise<SetupCompilationResult>;
    runSetupInteractiveTest(): Promise<SetupInteractiveResult>;
    validateSetupArtifacts(): Promise<SetupValidationResult>;
    testSetupReportExport(): Promise<SetupValidationResult>;
  };
}

declare global {
  interface Window {
    bickspecStudio?: StudioBridge;
  }
}

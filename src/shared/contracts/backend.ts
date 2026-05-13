export interface CompilerRepositoryConfig {
  repositoryPath: string;
  preferredArtifactPath?: string;
}

export interface BackendExecutionPreferences {
  javaCommand: string;
  mavenCommand: string;
}

export interface BackendWorkspacePreferences {
  defaultOutputDirectory: string;
  preserveGeneratedArtifacts: boolean;
}

export interface BackendSettings {
  compiler: CompilerRepositoryConfig;
  execution: BackendExecutionPreferences;
  workspace: BackendWorkspacePreferences;
}

export interface RepositorySignalStatus {
  name: "app/pom.xml" | "app/target" | "docs/BickSpec.g4" | "compiler-artifact";
  path: string;
  found: boolean;
}

export interface CompilerRepositoryValidation {
  repositoryPath: string;
  exists: boolean;
  isValid: boolean;
  signals: RepositorySignalStatus[];
  artifactCandidates: string[];
  message: string;
}

export interface ToolAvailability {
  command: string;
  available: boolean;
  version?: string;
  error?: string;
}

export interface BackendStatus {
  compilerRepository: CompilerRepositoryValidation;
  compilerArtifact: CompilerArtifactResolution;
  java: ToolAvailability;
  maven: ToolAvailability;
  settingsPath: string;
  defaultCompilerRepositoryPath: string;
}

export interface WorkspaceInfo {
  appRootPath: string;
  defaultCompilerRepositoryPath: string;
  configuredCompilerRepositoryPath: string;
  settingsPath: string;
}

export interface CompilerArtifactResolution {
  repositoryPath: string;
  artifactPath?: string;
  found: boolean;
  buildable: boolean;
  checkedPaths: string[];
  message: string;
}

export type CompilerExecutionTargetKind = "file" | "directory" | "target";
export type CompilerOutputTag = "STATUS" | "ERROR" | "SYMBOLS" | "TREE" | "JAVA" | "BUILD" | "EXECUTION" | "SUCCESS" | "SUMMARY" | "UNKNOWN";

export interface ParsedCompilerOutputLine {
  tag: CompilerOutputTag;
  message: string;
  raw: string;
  path?: string;
}

export interface ParsedCompilerOutput {
  lines: ParsedCompilerOutputLine[];
  diagnostics: ParsedCompilerOutputLine[];
  artifacts: ParsedCompilerOutputLine[];
  statuses: ParsedCompilerOutputLine[];
  success: boolean;
}

export interface CompilerExecutionRequest {
  targetPath: string;
  targetKind: CompilerExecutionTargetKind;
}

export interface CompilerExecutionResult {
  success: boolean;
  command: string;
  args: string[];
  workingDirectory: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  repositoryPath: string;
  compilerArtifactPath?: string;
  interactive: boolean;
  targetPath: string;
  targetKind: CompilerExecutionTargetKind;
  parsedOutput: ParsedCompilerOutput;
  error?: string;
}

export interface CompilerExecutionStatus {
  state: "idle" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  lastTargetPath?: string;
  lastExitCode?: number | null;
}

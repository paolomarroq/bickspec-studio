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


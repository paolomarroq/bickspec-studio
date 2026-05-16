import type {
  ArtifactCollection,
  CompilerDiagnostic,
  InteractiveSessionState,
  SetupState,
  SetupValidationResult
} from "./backend";

export interface SetupCompilationResult extends SetupValidationResult {
  buildLog?: string;
  programOutput?: string;
  diagnostics?: CompilerDiagnostic[];
  artifacts?: ArtifactCollection;
}

export interface SetupInteractiveResult extends SetupValidationResult {
  session?: InteractiveSessionState;
}


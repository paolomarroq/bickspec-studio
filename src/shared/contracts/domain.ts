export type ThemeMode = "light" | "dark";
export type ArtifactKind = "java" | "json" | "pdf" | "csv" | "excel";
export type CompileStatus = "idle" | "ready" | "running" | "succeeded" | "failed";

export interface StudioProject {
  id: string;
  name: string;
  path: string;
  modifiedAt: string;
}

export interface CompileDiagnostic {
  severity: "info" | "warning" | "error";
  message: string;
  location: string;
}

export interface CompileResult {
  status: CompileStatus;
  diagnostics: CompileDiagnostic[];
  durationMs: number;
}

export interface GeneratedArtifact {
  id: string;
  name: string;
  kind: ArtifactKind;
  size: string;
  updatedAt: string;
}

export interface ReportExportRequest {
  reportId: string;
  format: "pdf" | "csv" | "excel";
}

export interface StudioSettings {
  theme: ThemeMode;
  compilerChannel: "stable" | "preview";
  autoSave: boolean;
  telemetry: boolean;
}


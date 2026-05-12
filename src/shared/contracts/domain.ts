export type ThemeMode = "light" | "dark" | "system";
export type ArtifactKind = "java" | "json" | "pdf" | "csv" | "excel";
export type CompileStatus = "idle" | "ready" | "running" | "succeeded" | "failed";

export interface StudioProject {
  id: string;
  name: string;
  path: string;
  modifiedAt: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  kind: "folder" | "bks" | "csv" | "java" | "json" | "markdown" | "log";
  depth: number;
  status?: "active" | "generated" | "modified" | "readonly";
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
  label?: string;
  status?: "generated" | "updated" | "stale";
  preview?: string;
}

export interface TerminalEntry {
  level: "command" | "info" | "success" | "warning" | "error";
  text: string;
}

export interface ReportPreview {
  id: string;
  title: string;
  status: "draft" | "generated" | "exported";
  generatedAt: string;
  metrics: Array<{ label: string; value: string; tone?: "default" | "accent" | "warn" }>;
  sections: Array<{ title: string; body: string }>;
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

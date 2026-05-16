import type { CompilerDiagnostic, GeneratedArtifactMetadata, InteractiveTranscriptEntry } from "./backend";

export type BickSpecReportStatus = "success" | "failed" | "interactive" | "interactive-completed" | "runtime-failed";

export interface BickSpecReportData {
  reportId: string;
  title: string;
  sourceName: string;
  sourcePath: string;
  generatedAt: string;
  status: BickSpecReportStatus;
  interactive: boolean;
  targetKind: string;
  diagnostics: CompilerDiagnostic[];
  artifacts: GeneratedArtifactMetadata[];
  programOutput: string;
  interactiveTranscript: string;
  interactiveEntries: InteractiveTranscriptEntry[];
  buildLog: string;
}

export type ReportExportFormat = "pdf" | "csv" | "excel";

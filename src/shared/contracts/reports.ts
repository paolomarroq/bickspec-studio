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
  sourceText?: string;
  financialReport?: FinancialReportModel;
}

export type ReportExportFormat = "pdf" | "csv" | "excel";

export interface FinancialMetric {
  key: string;
  label: string;
  value: number;
}

export interface FinancialCashFlow {
  period: number;
  label: string;
  value: number;
  cumulative: number;
}

export interface FinancialReportModel {
  detected: boolean;
  cashFlows: FinancialCashFlow[];
  rates: FinancialMetric[];
  npv: {
    base?: number;
    low?: number;
    high?: number;
  };
  investment?: number;
  payback?: number;
  roi?: number;
  totalReturn?: number;
  profitabilityIndex?: number;
  decisions: string[];
  builtIns: Array<"NPV" | "PAYBACK">;
  metrics: FinancialMetric[];
  diagnostics: string[];
}

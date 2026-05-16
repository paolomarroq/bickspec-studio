import { useMemo, useState } from "react";
import { Download, Eye, FileSpreadsheet, FileText, RefreshCw, ScrollText, PackageCheck, TerminalSquare, TriangleAlert } from "lucide-react";
import type { BickSpecReportData, ReportExportFormat } from "@shared/contracts/reports";
import { diagnosticLabels } from "@shared/diagnostics/diagnosticTypes";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ToolbarButton } from "../components/ui/ToolbarButton";
import { useStudioSession } from "../state/StudioSessionProvider";
import { cleanInteractiveEntries, extractPlainProgramOutput } from "@shared/reports/runtimeOutput";

const sections = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "output", label: "Program Output", icon: TerminalSquare },
  { id: "diagnostics", label: "Diagnostics", icon: TriangleAlert },
  { id: "artifacts", label: "Artifacts", icon: PackageCheck },
  { id: "build", label: "Build Log", icon: ScrollText }
] as const;

type SectionId = typeof sections[number]["id"];

export function ReportPreviewPage() {
  const { activeFile, lastSession, interactiveSession } = useStudioSession();
  const [selectedSection, setSelectedSection] = useState<SectionId>("summary");
  const [exportState, setExportState] = useState<"ready" | "exporting" | "exported" | "error">("ready");
  const [message, setMessage] = useState("");

  const report = useMemo<BickSpecReportData | null>(() => {
    if (!lastSession) return null;
    const sourcePath = lastSession.summary.targetPath;
    const sourceName = activeFile?.path === sourcePath ? activeFile.name : fileNameFromPath(sourcePath);
    const title = `${stripExtension(sourceName)} Report`;
    const generatedAt = lastSession.summary.completedAt ?? new Date().toISOString();
    const status = getReportStatus(lastSession.summary.interactive, interactiveSession.status, lastSession.diagnostics, lastSession.normalized.buildLog);
    return {
      reportId: `${stripExtension(sourceName)}-${generatedAt.replace(/[:.]/g, "-")}`,
      title,
      sourceName,
      sourcePath,
      generatedAt,
      status,
      interactive: lastSession.summary.interactive,
      targetKind: lastSession.summary.targetKind,
      diagnostics: lastSession.diagnostics,
      artifacts: lastSession.artifacts.artifacts,
      programOutput: lastSession.normalized.programOutput,
      interactiveTranscript: interactiveSession.transcript || lastSession.normalized.interactiveOutput,
      interactiveEntries: cleanInteractiveEntries(interactiveSession.entries),
      buildLog: lastSession.normalized.buildLog
    };
  }, [activeFile, interactiveSession.transcript, lastSession]);

  async function exportReport(format: ReportExportFormat) {
    if (!report) return;
    setExportState("exporting");
    setMessage("");
    try {
      const path = await window.bickspecStudio?.backend.exportReport(report, format);
      if (path) {
        setExportState("exported");
        setMessage(`Exported ${format.toUpperCase()} report.`);
      } else {
        setExportState("ready");
      }
    } catch {
      setExportState("error");
      setMessage(`Failed to export ${format.toUpperCase()} report.`);
    }
  }

  if (!report) {
    return <div className="report-empty">No report available. Run a BickSpec file first.</div>;
  }

  return (
    <div className="screen-grid" style={{ gridTemplateColumns: "260px minmax(0, 1fr) 320px", gridTemplateRows: "52px 1fr" }}>
      <header style={{ gridColumn: "1 / 4", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-low)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <strong>BickSpec</strong>
          <span className="label-caps">Report Preview</span>
          <StatusBadge tone={report.status === "failed" || report.status === "runtime-failed" ? "warn" : report.status === "interactive" ? "neutral" : "success"}>{exportState === "exporting" ? "Exporting" : statusLabel(report.status)}</StatusBadge>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <ToolbarButton icon={<Eye size={16} />} onClick={() => setSelectedSection("summary")}>Preview Report</ToolbarButton>
          <ToolbarButton icon={<FileText size={16} />} onClick={() => void exportReport("pdf")}>Export PDF</ToolbarButton>
          <ToolbarButton icon={<FileSpreadsheet size={16} />} onClick={() => void exportReport("excel")}>Excel</ToolbarButton>
          <ToolbarButton icon={<Download size={16} />} onClick={() => void exportReport("csv")}>CSV</ToolbarButton>
          <button className="icon-button" aria-label="Refresh preview" onClick={() => setSelectedSection((section) => section)}><RefreshCw size={16} /></button>
        </div>
      </header>

      <aside className="side-panel">
        <div style={{ padding: 18 }}>
          <div className="label-caps">Source</div>
          <div className="mono report-source-name">{report.sourceName}</div>
        </div>
        <nav style={{ display: "grid", gap: 5, padding: "0 10px" }}>
          {sections.map(({ id, label, icon: Icon }) => (
            <button className={`nav-row ${selectedSection === id ? "active" : ""}`} key={id} onClick={() => setSelectedSection(id)}>
              <Icon size={17} />
              <span className="label-caps">{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="report-main">
        <article className="report-sheet">
          <p className="label-caps" style={{ color: "var(--color-teal)" }}>{statusLabel(report.status)} report</p>
          <h1 style={{ margin: "8px 0 8px", fontSize: 32 }}>{report.title}</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Generated from {report.sourcePath} at {new Date(report.generatedAt).toLocaleString()}.</p>
          {selectedSection === "summary" ? <SummarySection report={report} /> : null}
          {selectedSection === "output" ? <OutputSection report={report} /> : null}
          {selectedSection === "diagnostics" ? <DiagnosticsSection report={report} /> : null}
          {selectedSection === "artifacts" ? <ArtifactsSection report={report} /> : null}
          {selectedSection === "build" ? <BuildLogSection report={report} /> : null}
        </article>
      </main>

      <aside className="report-sidebar">
        <Panel title="Export Actions">
          <div style={{ padding: 16, display: "grid", gap: 12 }}>
            <ToolbarButton primary icon={<FileText size={16} />} onClick={() => void exportReport("pdf")}>Export PDF</ToolbarButton>
            <ToolbarButton icon={<FileSpreadsheet size={16} />} onClick={() => void exportReport("excel")}>Export Excel</ToolbarButton>
            <ToolbarButton icon={<Download size={16} />} onClick={() => void exportReport("csv")}>Export CSV</ToolbarButton>
          </div>
        </Panel>
        <Panel title="Report Metadata">
          <div style={{ padding: 16 }}>
            <p className="mono report-metadata">
              reportId: {report.reportId}<br />
              source: {report.sourcePath}<br />
              generatedAt: {new Date(report.generatedAt).toLocaleString()}<br />
              selected: {selectedSection}<br />
              status: {statusLabel(report.status)}<br />
              diagnostics: {report.diagnostics.length}<br />
              artifacts: {report.artifacts.length}
            </p>
            {message ? <p className="report-feedback">{message}</p> : null}
          </div>
        </Panel>
      </aside>
    </div>
  );
}

function SummarySection({ report }: { report: BickSpecReportData }) {
  return <section className="report-section"><h2>Summary</h2><div className="report-summary-grid">
    <span>Source</span><strong>{report.sourcePath}</strong>
    <span>Status</span><strong>{statusLabel(report.status)}</strong>
    <span>Mode</span><strong>{report.interactive ? "Interactive" : "Non-interactive"}</strong>
    <span>Target</span><strong>{report.targetKind}</strong>
    <span>Diagnostics</span><strong>{report.diagnostics.length}</strong>
    <span>Artifacts</span><strong>{report.artifacts.length}</strong>
  </div></section>;
}

function OutputSection({ report }: { report: BickSpecReportData }) {
  const output = report.interactive ? report.interactiveEntries.map((entry) => `${entry.speaker === "program" ? "Program" : "Input"}: ${entry.text}`).join("\n") : extractPlainProgramOutput(report.programOutput).join("\n");
  return <section className="report-section"><h2>{report.interactive ? "Interactive Transcript" : "Program Output"}</h2><pre className="report-pre">{output || "No program output."}</pre></section>;
}

function DiagnosticsSection({ report }: { report: BickSpecReportData }) {
  return <section className="report-section"><h2>Diagnostics</h2>{report.diagnostics.length === 0 ? <p>No errors detected.</p> : report.diagnostics.map((diagnostic) => (
    <div className="report-diagnostic" key={diagnostic.code}>
      <strong>{diagnostic.code} · {diagnosticLabels[diagnostic.category]}</strong>
      <span>{diagnostic.message}</span>
      <span className="mono">{[diagnostic.filePath, diagnostic.line, diagnostic.column].filter(Boolean).join(":")}</span>
      {diagnostic.suggestion ? <em>{diagnostic.suggestion}</em> : null}
    </div>
  ))}</section>;
}

function ArtifactsSection({ report }: { report: BickSpecReportData }) {
  return <section className="report-section"><h2>Artifacts</h2>{report.artifacts.length === 0 ? <p>No artifacts discovered.</p> : (
    <table className="content-table"><thead><tr><th>Type</th><th>Path</th><th>Status</th></tr></thead><tbody>
      {report.artifacts.map((artifact) => <tr key={artifact.id}><td>{artifact.type}</td><td className="mono">{artifact.absolutePath}</td><td>{artifact.exists ? "Exists" : "Missing"}</td></tr>)}
    </tbody></table>
  )}</section>;
}

function BuildLogSection({ report }: { report: BickSpecReportData }) {
  return <section className="report-section"><h2>Build Log</h2><pre className="report-pre">{report.buildLog || "No build log."}</pre></section>;
}

function fileNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

function getReportStatus(
  interactive: boolean,
  interactiveStatus: "idle" | "waiting" | "completed" | "failed",
  diagnostics: BickSpecReportData["diagnostics"],
  buildLog: string
): BickSpecReportData["status"] {
  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) return "failed";
  if (interactive) {
    if (interactiveStatus === "failed") return "runtime-failed";
    if (interactiveStatus === "completed") return "interactive-completed";
    return "interactive";
  }
  return /\[EXECUTION]\s+completed successfully/i.test(buildLog) ? "success" : "failed";
}

function statusLabel(status: BickSpecReportData["status"]): string {
  switch (status) {
    case "success": return "Build Successful";
    case "interactive": return "Interactive session";
    case "interactive-completed": return "Interactive completed";
    case "runtime-failed": return "Runtime failed";
    case "failed": return "Build Failed";
  }
}

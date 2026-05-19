import { useMemo, useState } from "react";
import { BarChart3, Download, Eye, FileSpreadsheet, FileText, RefreshCw, ScrollText, PackageCheck, TerminalSquare, TriangleAlert } from "lucide-react";
import type { BickSpecReportData, FinancialCashFlow, FinancialReportModel, ReportExportFormat } from "@shared/contracts/reports";
import { diagnosticLabels } from "@shared/diagnostics/diagnosticTypes";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ToolbarButton } from "../components/ui/ToolbarButton";
import { useStudioSession } from "../state/StudioSessionProvider";
import { cleanInteractiveEntries, extractPlainProgramOutput } from "@shared/reports/runtimeOutput";
import { extractFinancialReport } from "@shared/reports/financialReportExtractor";

const sections = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "finance", label: "Finance", icon: BarChart3 },
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
    const sourceText = activeFile?.path === sourcePath ? activeFile.content : undefined;
    const financialReport = extractFinancialReport({
      sourceText,
      programOutput: lastSession.normalized.programOutput,
      interactiveComplete: !lastSession.summary.interactive || interactiveSession.status === "completed"
    });
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
      buildLog: lastSession.normalized.buildLog,
      sourceText,
      financialReport
    };
  }, [activeFile, interactiveSession.status, interactiveSession.transcript, lastSession]);

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
          {selectedSection === "finance" ? <FinanceSection report={report} /> : null}
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
  return <section className="report-section"><h2>Summary</h2>
    <div className="report-summary-grid">
      <span>Source</span><strong>{report.sourcePath}</strong>
      <span>Status</span><strong>{statusLabel(report.status)}</strong>
      <span>Mode</span><strong>{report.interactive ? "Interactive" : "Non-interactive"}</strong>
      <span>Target</span><strong>{report.targetKind}</strong>
      <span>Diagnostics</span><strong>{report.diagnostics.length}</strong>
      <span>Artifacts</span><strong>{report.artifacts.length}</strong>
    </div>
    {report.financialReport?.detected ? <FinancialSummaryCards financial={report.financialReport} /> : <FinancialEmptyState financial={report.financialReport} />}
  </section>;
}

function FinanceSection({ report }: { report: BickSpecReportData }) {
  const financial = report.financialReport;
  if (!financial?.detected) return <section className="report-section"><h2>Financial Analysis</h2><FinancialEmptyState financial={financial} /></section>;
  return (
    <section className="report-section">
      <h2>Financial Analysis</h2>
      <FinancialSummaryCards financial={financial} />
      <BuiltInAnalysis financial={financial} />
      {financial.cashFlows.length ? (
        <>
          <h3>Cash Flow Table</h3>
          <table className="content-table"><thead><tr><th>Period</th><th>Cash Flow</th><th>Cumulative Cash Flow</th></tr></thead><tbody>
            {financial.cashFlows.map((flow) => <tr key={flow.period}><td>{flow.period}</td><td>{formatCurrency(flow.value)}</td><td>{formatCurrency(flow.cumulative)}</td></tr>)}
          </tbody></table>
          <h3>Cash Flow Chart</h3>
          <CashFlowChart cashFlows={financial.cashFlows} />
          <h3>Cumulative Payback</h3>
          <CumulativeChart cashFlows={financial.cashFlows} payback={financial.payback} />
        </>
      ) : null}
      {hasSensitivity(financial) ? (
        <>
          <h3>NPV Sensitivity</h3>
          <NpvSensitivityChart financial={financial} />
        </>
      ) : null}
      {financial.diagnostics.length ? <ul className="report-financial-diagnostics">{financial.diagnostics.map((diagnostic) => <li key={diagnostic}>{diagnostic}</li>)}</ul> : null}
    </section>
  );
}

function FinancialSummaryCards({ financial }: { financial: FinancialReportModel }) {
  const cards = [
    financial.npv.base !== undefined ? ["NPV Base", formatCurrency(financial.npv.base)] : undefined,
    financial.payback !== undefined ? ["Payback Years", formatNumber(financial.payback)] : undefined,
    financial.roi !== undefined ? ["ROI", formatPercentLike(financial.roi)] : undefined,
    financial.totalReturn !== undefined ? ["Total Return", formatCurrency(financial.totalReturn)] : undefined,
    financial.investment !== undefined ? ["Investment", formatCurrency(financial.investment)] : undefined,
    financial.decisions[0] ? ["Decision", financial.decisions[0].replace(/^.*Decision:\s*/i, "")] : undefined
  ].filter(Boolean) as string[][];
  if (!cards.length) return null;
  return <div className="report-financial-cards">{cards.map(([label, value]) => <article className="report-financial-card" key={label}><span className="label-caps">{label}</span><strong>{value}</strong></article>)}</div>;
}

function FinancialEmptyState({ financial }: { financial?: FinancialReportModel }) {
  return <div className="report-financial-empty">{financial?.diagnostics[0] ?? "No financial chart data detected. Use CF0..CFN, NPV(...), PAYBACK(...), ROI, or related variables to enable financial charts."}</div>;
}

function BuiltInAnalysis({ financial }: { financial: FinancialReportModel }) {
  return <div className="report-builtins"><span className="label-caps">Built-in Function Analysis</span>{["NPV", "PAYBACK"].map((name) => <strong className={financial.builtIns.includes(name as "NPV" | "PAYBACK") ? "detected" : ""} key={name}>{name} {financial.builtIns.includes(name as "NPV" | "PAYBACK") ? "detected" : "not detected"}</strong>)}</div>;
}

function CashFlowChart({ cashFlows }: { cashFlows: FinancialCashFlow[] }) {
  const width = 720;
  const height = 260;
  const padding = 38;
  const values = cashFlows.map((flow) => flow.value);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const scale = (value: number) => height - padding - ((value - min) / (max - min || 1)) * (height - padding * 2);
  const zeroY = scale(0);
  const barWidth = (width - padding * 2) / cashFlows.length * 0.62;
  return <svg className="report-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Cash flow bar chart">
    <line x1={padding} x2={width - padding} y1={zeroY} y2={zeroY} className="chart-zero" />
    {cashFlows.map((flow, index) => {
      const slot = (width - padding * 2) / cashFlows.length;
      const x = padding + index * slot + (slot - barWidth) / 2;
      const y = Math.min(scale(flow.value), zeroY);
      const h = Math.abs(zeroY - scale(flow.value));
      return <g key={`${flow.label}-${flow.period}`}><rect x={x} y={y} width={barWidth} height={Math.max(2, h)} className={flow.value < 0 ? "chart-bar negative" : "chart-bar"} /><text x={x + barWidth / 2} y={height - 10} textAnchor="middle">{flow.label.startsWith("Cash Flow") ? `CF${flow.period}` : flow.label}</text></g>;
    })}
  </svg>;
}

function CumulativeChart({ cashFlows, payback }: { cashFlows: FinancialCashFlow[]; payback?: number }) {
  const width = 720;
  const height = 260;
  const padding = 38;
  const values = cashFlows.map((flow) => flow.cumulative);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const x = (index: number) => padding + (index / Math.max(1, cashFlows.length - 1)) * (width - padding * 2);
  const y = (value: number) => height - padding - ((value - min) / (max - min || 1)) * (height - padding * 2);
  const points = cashFlows.map((flow, index) => `${x(index)},${y(flow.cumulative)}`).join(" ");
  return <svg className="report-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Cumulative cash flow chart">
    <line x1={padding} x2={width - padding} y1={y(0)} y2={y(0)} className="chart-zero" />
    <polyline points={points} className="chart-line" />
    {cashFlows.map((flow, index) => <circle key={flow.period} cx={x(index)} cy={y(flow.cumulative)} r="4" className="chart-point" />)}
    {payback !== undefined ? <text x={width - padding} y={padding} textAnchor="end" className="chart-callout">Payback: {formatNumber(payback)} years</text> : null}
  </svg>;
}

function NpvSensitivityChart({ financial }: { financial: FinancialReportModel }) {
  const rows = [
    { label: rateLabel(financial, "RATE_LOW", "Low Rate"), value: financial.npv.low ?? 0 },
    { label: rateLabel(financial, "RATE", "Base Rate"), value: financial.npv.base ?? 0 },
    { label: rateLabel(financial, "RATE_HIGH", "High Rate"), value: financial.npv.high ?? 0 }
  ];
  return <CashFlowChart cashFlows={rows.map((row, index) => ({ period: index, label: row.label, value: row.value, cumulative: row.value }))} />;
}

function hasSensitivity(financial: FinancialReportModel): boolean {
  return financial.npv.low !== undefined && financial.npv.base !== undefined && financial.npv.high !== undefined;
}

function rateLabel(financial: FinancialReportModel, key: string, fallback: string): string {
  const rate = financial.rates.find((metric) => metric.key === key);
  return rate ? `${fallback} (${formatPercentLike(rate.value)})` : fallback;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function formatPercentLike(value: number): string {
  return `${(value * 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
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

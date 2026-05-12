import { useEffect, useState } from "react";
import { Download, Eye, FileSpreadsheet, FileText, History, LineChart, RefreshCw, Table2 } from "lucide-react";
import type { ReportPreview } from "@shared/contracts/domain";
import { MetricCard } from "../components/ui/MetricCard";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ToolbarButton } from "../components/ui/ToolbarButton";
import { useServices } from "../services/ServiceProvider";

const reportNav = [
  { label: "Summary", icon: FileText },
  { label: "Cash Flow Table", icon: Table2 },
  { label: "NPV Analysis", icon: LineChart },
  { label: "Sensitivity Chart", icon: LineChart },
  { label: "Recent Reports", icon: History }
];

export function ReportPreviewPage() {
  const services = useServices();
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [selectedSection, setSelectedSection] = useState("Summary");
  const [exportState, setExportState] = useState<"ready" | "exporting" | "exported">("ready");

  useEffect(() => {
    void services.reports.getPreview("portfolio-report").then(setPreview);
  }, [services]);

  function exportReport(format: "pdf" | "csv" | "excel") {
    setExportState("exporting");
    void services.reports.exportReport({ reportId: "portfolio-report", format }).then(() => {
      setExportState("exported");
      window.setTimeout(() => setExportState("ready"), 900);
    });
  }

  return (
    <div className="screen-grid" style={{ gridTemplateColumns: "260px minmax(0, 1fr) 320px", gridTemplateRows: "52px 1fr" }}>
      <header style={{ gridColumn: "1 / 4", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-low)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <strong>BickSpec</strong>
          <span className="label-caps">Report Preview</span>
          <StatusBadge>{exportState === "exporting" ? "Exporting" : "Report Generated"}</StatusBadge>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <ToolbarButton icon={<Eye size={16} />}>Preview Report</ToolbarButton>
          <ToolbarButton icon={<FileText size={16} />} onClick={() => exportReport("pdf")}>Export PDF</ToolbarButton>
          <ToolbarButton icon={<FileSpreadsheet size={16} />} onClick={() => exportReport("excel")}>Excel</ToolbarButton>
          <ToolbarButton icon={<Download size={16} />} onClick={() => exportReport("csv")}>CSV</ToolbarButton>
          <button className="icon-button" aria-label="Refresh preview"><RefreshCw size={16} /></button>
        </div>
      </header>

      <aside className="side-panel">
        <div style={{ padding: 18 }}>
          <div className="label-caps">Workspace</div>
          <div className="mono" style={{ marginTop: 4, color: "var(--color-teal)", fontSize: 12 }}>v1.0.4-stable</div>
        </div>
        <nav style={{ display: "grid", gap: 5, padding: "0 10px" }}>
          {reportNav.map(({ label, icon: Icon }) => (
            <button className={`nav-row ${selectedSection === label ? "active" : ""}`} key={label} onClick={() => setSelectedSection(label)}>
              <Icon size={17} />
              <span className="label-caps">{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ padding: 24, overflow: "auto", background: "var(--color-surface-container)" }}>
        <article className="report-sheet">
          <p className="label-caps" style={{ color: "var(--color-teal)" }}>{preview?.status ?? "generated"} report</p>
          <h1 style={{ margin: "8px 0 8px", fontSize: 32 }}>{preview?.title ?? "Portfolio Analysis Report"}</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Generated from portfolio-analysis.bks at {preview?.generatedAt ?? "loading"}.</p>

          <section className="metric-grid" style={{ margin: "26px 0" }}>
            {(preview?.metrics ?? []).map((metric) => (
              <MetricCard key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
            ))}
          </section>

          {(preview?.sections ?? []).map((section) => (
            <section key={section.title} style={{ marginTop: 26 }}>
              <h2>{section.title}</h2>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.65 }}>{section.body}</p>
            </section>
          ))}

          <table className="content-table" style={{ marginTop: 28 }}>
            <thead>
              <tr><th>Output</th><th>Value</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td>Expected Return</td><td className="mono">7.82%</td><td>Validated</td></tr>
              <tr><td>Total Weight</td><td className="mono">1.0</td><td>Passing</td></tr>
              <tr><td>Export Targets</td><td className="mono">pdf, csv, excel</td><td>Ready</td></tr>
            </tbody>
          </table>
        </article>
      </main>

      <aside style={{ borderLeft: "1px solid var(--color-outline-variant)", background: "var(--color-surface-low)", overflow: "auto" }}>
        <Panel title="Export Actions">
          <div style={{ padding: 16, display: "grid", gap: 12 }}>
            <ToolbarButton primary icon={<FileText size={16} />} onClick={() => exportReport("pdf")}>Export PDF</ToolbarButton>
            <ToolbarButton icon={<FileSpreadsheet size={16} />} onClick={() => exportReport("excel")}>Export Excel</ToolbarButton>
            <ToolbarButton icon={<Download size={16} />} onClick={() => exportReport("csv")}>Export CSV</ToolbarButton>
          </div>
        </Panel>
        <Panel title="Report Metadata">
          <div style={{ padding: 16 }}>
            <p className="mono" style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
              reportId: portfolio-report<br />
              source: portfolio-analysis.bks<br />
              service: Local report service<br />
              selected: {selectedSection}
            </p>
          </div>
        </Panel>
      </aside>
    </div>
  );
}

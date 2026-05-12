import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Panel } from "../components/ui/Panel";

export function ReportPreviewPage() {
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "260px 1fr 320px" }}>
      <Panel title="Workspace">
        <nav style={{ display: "grid", padding: 8 }}>
          {["Summary", "Cash Flow Table", "NPV Analysis", "Sensitivity Chart", "Recent Reports"].map((item, index) => (
            <button key={item} className={`tab ${index === 0 ? "active" : ""}`} style={{ textAlign: "left" }}>{item}</button>
          ))}
        </nav>
      </Panel>
      <main style={{ padding: 24, overflow: "auto" }}>
        <article className="panel" style={{ maxWidth: 860, margin: "0 auto", padding: 32, minHeight: 720 }}>
          <p className="label-caps" style={{ color: "var(--color-teal)" }}>Report Generated</p>
          <h1 style={{ marginTop: 8 }}>Portfolio Analysis Report</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Generated from portfolio-analysis.bks using the UI mock report service.</p>
          <hr style={{ border: 0, borderTop: "1px solid var(--color-outline-variant)", margin: "24px 0" }} />
          <h2>Executive Summary</h2>
          <p>Expected return is calculated from weighted asset CAGR. The report preview is static for this foundation commit and will later bind to compiler output.</p>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
            <tbody>
              {["Expected Return", "Total Weight", "Horizon", "Validation Status"].map((label, index) => (
                <tr key={label}>
                  <td className="label-caps" style={{ border: "1px solid var(--color-outline-variant)", padding: 12 }}>{label}</td>
                  <td className="mono" style={{ border: "1px solid var(--color-outline-variant)", padding: 12 }}>{["7.82%", "1.0", "1y", "Passing"][index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </main>
      <Panel title="Export">
        <div style={{ padding: 16, display: "grid", gap: 12 }}>
          <button className="button primary"><FileText size={16} /> Export PDF</button>
          <button className="button"><FileSpreadsheet size={16} /> Export Excel</button>
          <button className="button"><Download size={16} /> Export CSV</button>
          <div style={{ borderTop: "1px solid var(--color-outline-variant)", paddingTop: 16 }}>
            <span className="label-caps">Report Metadata</span>
            <p className="mono" style={{ color: "var(--color-text-muted)" }}>v1.0.4-stable<br />mock service<br />portfolio-analysis.bks</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}


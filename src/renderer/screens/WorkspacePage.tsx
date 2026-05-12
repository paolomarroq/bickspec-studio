import { Panel } from "../components/ui/Panel";

const codeLines = [
  "spec PortfolioAnalysis {",
  "  input assets: Array<Asset>;",
  "  input horizon: Duration = \"1y\";",
  "",
  "  calculate expected_return =",
  "    assets.sum(a => a.weight * a.cagr);",
  "",
  "  validate total_weight {",
  "    assets.sum(a => a.weight) == 1.0;",
  "  }",
  "}"
];

export function WorkspacePage() {
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "260px minmax(520px, 1fr) 320px", gridTemplateRows: "1fr 220px" }}>
      <Panel title="Explorer" className="" >
        <div style={{ padding: 12 }}>
          {["portfolio-analysis.bks", "inputs/assets.csv", "reports/portfolio.md", "generated/PortfolioAnalysis.java"].map((item) => (
            <div key={item} className="mono" style={{ padding: "8px 10px", borderLeft: item.endsWith(".bks") ? "2px solid var(--color-teal)" : "2px solid transparent", background: item.endsWith(".bks") ? "var(--color-surface-high)" : "transparent" }}>
              {item}
            </div>
          ))}
        </div>
      </Panel>
      <section style={{ minWidth: 0, borderRight: "1px solid var(--color-outline-variant)" }}>
        <div className="tabs">
          <button className="tab active">portfolio-analysis.bks</button>
          <button className="tab">cash-flow-table.csv</button>
        </div>
        <pre className="code-editor">
          <code>
            {codeLines.map((line, index) => (
              <span className="code-line" data-line={String(index + 1)} key={`${index}-${line}`}>
                {line}
              </span>
            ))}
          </code>
        </pre>
      </section>
      <Panel title="Inspector">
        <div style={{ padding: 16, display: "grid", gap: 14 }}>
          <div><span className="label-caps">Spec Name</span><strong style={{ display: "block" }}>PortfolioAnalysis</strong></div>
          <div><span className="label-caps">Inputs</span><strong style={{ display: "block" }}>2 declared</strong></div>
          <div><span className="label-caps">Validations</span><strong style={{ display: "block", color: "var(--color-teal)" }}>1 passing</strong></div>
          <button className="button primary">Run Compile</button>
        </div>
      </Panel>
      <Panel title="Terminal / Output" className="" >
        <pre className="mono" style={{ margin: 0, padding: 16, color: "var(--color-text-muted)" }}>
{`> bickspec compile portfolio-analysis.bks
[mock] parser ready
[mock] generated PortfolioAnalysis.java
[mock] report artifacts staged`}
        </pre>
      </Panel>
      <Panel title="Problems">
        <div style={{ padding: 16 }}>
          <div style={{ color: "var(--color-amber)" }}>Warning: sensitivity range uses default confidence interval.</div>
        </div>
      </Panel>
    </div>
  );
}


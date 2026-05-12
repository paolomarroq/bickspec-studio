import { FilePlus2, FolderOpen, FileCode2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Panel } from "../components/ui/Panel";
import { recentProjects } from "../services/mockData";

export function WelcomePage() {
  return (
    <div className="page grid-page">
      <section style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 48, lineHeight: 1.15 }}>BickSpec</h1>
              <p className="label-caps" style={{ color: "var(--color-teal)", marginTop: 8 }}>
                A specification language for finance
              </p>
            </div>
          </div>
          <p style={{ maxWidth: 740, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            A structured desktop workspace for writing, compiling, reviewing, and exporting financial specifications.
          </p>
        </div>
        <Panel title="Code Preview">
          <pre className="code-editor" style={{ minHeight: 220 }}>
            <code>
              <span className="code-line" data-line="1"><span className="kw">spec</span> PortfolioAnalysis {"{"}</span>
              <span className="code-line" data-line="2">  <span className="kw">input</span> assets: Array&lt;Asset&gt;;</span>
              <span className="code-line" data-line="3">  <span className="kw">input</span> horizon: Duration = <span className="str">"1y"</span>;</span>
              <span className="code-line" data-line="4">  <span className="comment">// Compute weighted CAGR</span></span>
              <span className="code-line" data-line="5">  <span className="kw">calculate</span> expected_return = assets.sum(a =&gt; a.weight * a.cagr);</span>
              <span className="code-line" data-line="6">{"}"}</span>
            </code>
          </pre>
        </Panel>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Link className="panel" to="/workspace" style={{ padding: 24, color: "inherit", textDecoration: "none", background: "var(--color-teal)" }}>
          <FilePlus2 />
          <h2>New BickSpec File</h2>
          <p>Start from a clean specification template.</p>
        </Link>
        <Link className="panel" to="/workspace" style={{ padding: 24, color: "inherit", textDecoration: "none" }}>
          <FileCode2 color="var(--color-teal)" />
          <h2>Open .bks File</h2>
          <p>Open an existing single specification file.</p>
        </Link>
        <Link className="panel" to="/workspace" style={{ padding: 24, color: "inherit", textDecoration: "none" }}>
          <FolderOpen color="var(--color-teal)" />
          <h2>Open Project Folder</h2>
          <p>Load a complete multi-file financial project.</p>
        </Link>
      </section>

      <Panel title="Recent Projects" action={<button className="button">Clear Recent</button>}>
        {recentProjects.map((project) => (
          <Link key={project.id} to="/workspace" style={{ display: "flex", justifyContent: "space-between", padding: 14, color: "inherit", textDecoration: "none", borderBottom: "1px solid var(--color-outline-variant)" }}>
            <span>
              <strong>{project.name}</strong>
              <span className="mono" style={{ display: "block", color: "var(--color-text-muted)", fontSize: 12 }}>{project.path}</span>
            </span>
            <span style={{ color: "var(--color-text-muted)" }}>{project.modifiedAt}</span>
          </Link>
        ))}
      </Panel>
    </div>
  );
}


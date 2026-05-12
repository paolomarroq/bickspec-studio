import { FilePlus2, FolderOpen, FileCode2, History, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Panel } from "../components/ui/Panel";
import { LauncherActionCard } from "../components/launcher/LauncherActionCard";
import { useServices } from "../services/ServiceProvider";
import type { StudioProject } from "@shared/contracts/domain";

export function WelcomePage() {
  const services = useServices();
  const [projects, setProjects] = useState<StudioProject[]>([]);

  useEffect(() => {
    void services.projects.listRecentProjects().then(setProjects);
  }, [services]);

  return (
    <div className="launcher-grid">
      <aside className="side-panel" style={{ padding: 18 }}>
        <div className="label-caps">Workspace</div>
        <div className="mono" style={{ marginTop: 4, color: "var(--color-teal)", fontSize: 12 }}>v1.0.4-stable</div>
        <nav style={{ display: "grid", gap: 6, marginTop: 28 }}>
          {["New File", "Open", "Recent", "Documentation"].map((item, index) => (
            <Link className={`nav-row ${index === 0 ? "active" : ""}`} to={index === 2 ? "/" : "/workspace"} key={item}>
              <LayoutGrid size={16} />
              <span className="label-caps">{item}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="page spec-grid-pattern" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <section>
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
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 30 }}>
          <LauncherActionCard to="/workspace" primary icon={<FilePlus2 />} title="New BickSpec File" description="Create a blank financial logic schema." />
          <LauncherActionCard to="/workspace" icon={<FileCode2 color="var(--color-teal)" />} title="Open .bks File" description="Open an existing single specification file." />
          <LauncherActionCard to="/workspace" icon={<FolderOpen color="var(--color-teal)" />} title="Open Project Folder" description="Load a multi-file financial project." />
        </section>
      </main>

      <aside style={{ padding: 18, background: "var(--color-surface)", borderLeft: "1px solid var(--color-outline-variant)", overflow: "auto" }}>
        <Panel title="Code Preview">
          <pre className="code-editor" style={{ minHeight: 240 }}>
            <code>
              <span className="code-line" data-line="1"><span className="kw">spec</span> PortfolioAnalysis {"{"}</span>
              <span className="code-line" data-line="2">  <span className="kw">input</span> assets: Array&lt;Asset&gt;;</span>
              <span className="code-line" data-line="3">  <span className="kw">calculate</span> expected_return = assets.sum(a =&gt; a.weight * a.cagr);</span>
              <span className="code-line" data-line="4">  <span className="kw">export</span> pdf, csv, excel;</span>
              <span className="code-line" data-line="5">{"}"}</span>
            </code>
          </pre>
        </Panel>
        <Panel title="Recent Projects" action={<History size={16} />}>
          {projects.map((project) => (
          <Link key={project.id} to="/workspace" style={{ display: "flex", justifyContent: "space-between", padding: 14, color: "inherit", textDecoration: "none", borderBottom: "1px solid var(--color-outline-variant)" }}>
            <span>
              <strong>{project.name}</strong>
              <span className="mono" style={{ display: "block", color: "var(--color-text-muted)", fontSize: 12 }}>{project.path}</span>
            </span>
            <span style={{ color: "var(--color-text-muted)" }}>{project.modifiedAt}</span>
          </Link>
          ))}
        </Panel>
      </aside>
    </div>
  );
}

import { useEffect, useState } from "react";
import { BarChart3, Bug, GitBranch, MoreHorizontal, PackageCheck, Play, Search } from "lucide-react";
import type { CompileDiagnostic, ProjectFile, StudioProject, TerminalEntry } from "@shared/contracts/domain";
import { CodeEditor } from "../components/ide/CodeEditor";
import { DiagnosticsList } from "../components/ide/DiagnosticsList";
import { FileTree } from "../components/ide/FileTree";
import { TerminalPanel } from "../components/ide/TerminalPanel";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ToolbarButton } from "../components/ui/ToolbarButton";
import { terminalEntries } from "../services/mockData";
import { useServices } from "../services/ServiceProvider";

export function WorkspacePage() {
  const services = useServices();
  const [project, setProject] = useState<StudioProject | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [activeTab, setActiveTab] = useState("portfolio-analysis.bks");
  const [diagnostics, setDiagnostics] = useState<CompileDiagnostic[]>([]);
  const [buildState, setBuildState] = useState<"ready" | "running" | "succeeded">("ready");
  const [output, setOutput] = useState<TerminalEntry[]>(terminalEntries.slice(0, 2));

  useEffect(() => {
    void services.projects.getCurrentProject().then((nextProject) => {
      setProject(nextProject);
      void services.projects.listProjectFiles(nextProject.id).then((nextFiles) => {
        setFiles(nextFiles);
        setSelectedFile(nextFiles.find((file) => file.status === "active") ?? nextFiles[0]);
      });
    });
    void services.compiler.compile("portfolio-analysis").then((result) => setDiagnostics(result.diagnostics));
  }, [services]);

  function runBuild() {
    setBuildState("running");
    setOutput([{ level: "command", text: "> bickspec compile portfolio-analysis.bks --target java --report" }]);
    window.setTimeout(() => {
      setBuildState("succeeded");
      setOutput(terminalEntries);
    }, 450);
  }

  const selectedName = selectedFile?.name ?? activeTab;

  return (
    <div className="screen-grid" style={{ gridTemplateColumns: "260px minmax(520px, 1fr) 320px", gridTemplateRows: "1fr 230px" }}>
      <aside className="side-panel">
        <div className="panel-header">
          <span className="label-caps">Explorer</span>
          <MoreHorizontal size={16} />
        </div>
        <div style={{ padding: "12px 12px 4px" }}>
          <strong>{project?.name ?? "portfolio-analysis.bks"}</strong>
          <div className="mono" style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 3 }}>{project?.path}</div>
        </div>
        <FileTree
          files={files}
          selectedFileId={selectedFile?.id ?? ""}
          onSelect={(file) => {
            setSelectedFile(file);
            if (file.kind !== "folder") setActiveTab(file.name);
          }}
        />
      </aside>

      <section style={{ minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--color-outline-variant)" }}>
        <div className="tabs">
          {["portfolio-analysis.bks", "assets.csv", "PortfolioAnalysis.java"].map((tab) => (
            <button className={`tab ${activeTab === tab ? "active" : ""}`} key={tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
          <span style={{ marginLeft: "auto", padding: "9px 12px" }}>
            <StatusBadge tone={buildState === "running" ? "neutral" : "success"}>{buildState}</StatusBadge>
          </span>
        </div>
        <CodeEditor activeFileName={selectedName} />
      </section>

      <aside style={{ minWidth: 0, minHeight: 0, overflow: "auto" }}>
        <Panel title="Context Inspector">
          <div style={{ padding: 16, display: "grid", gap: 14 }}>
            <div><span className="label-caps">Current Spec</span><strong style={{ display: "block" }}>PortfolioAnalysis</strong></div>
            <div><span className="label-caps">Inputs</span><strong style={{ display: "block" }}>assets, horizon, confidence</strong></div>
            <div><span className="label-caps">Artifacts</span><strong style={{ display: "block", color: "var(--color-teal)" }}>5 staged</strong></div>
            <ToolbarButton primary icon={<Play size={16} />} onClick={runBuild}>Run Compile</ToolbarButton>
          </div>
        </Panel>
        <Panel title="Outline">
          <div style={{ padding: 12, display: "grid", gap: 8 }}>
            {[
              [GitBranch, "inputs", "3 declarations"],
              [BarChart3, "calculations", "2 formulas"],
              [Bug, "validations", "1 rule"],
              [PackageCheck, "report", "3 export formats"]
            ].map(([Icon, label, detail]) => {
              const Component = Icon as typeof GitBranch;
              return (
                <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Component size={16} color="var(--color-teal)" />
                  <span><strong>{String(label)}</strong><span className="mono" style={{ display: "block", color: "var(--color-text-muted)", fontSize: 12 }}>{String(detail)}</span></span>
                </div>
              );
            })}
          </div>
        </Panel>
      </aside>

      <section className="split-bottom" style={{ gridColumn: "1 / 4" }}>
        <Panel title="Terminal / Output">
          <TerminalPanel entries={output} />
        </Panel>
        <Panel title="Diagnostics" action={<Search size={15} />}>
          <DiagnosticsList diagnostics={diagnostics} />
        </Panel>
      </section>
    </div>
  );
}


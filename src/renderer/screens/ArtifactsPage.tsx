import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, FolderOpen, Play, RefreshCw } from "lucide-react";
import type { GeneratedArtifact } from "@shared/contracts/domain";
import { ArtifactNavigator } from "../components/artifacts/ArtifactNavigator";
import { DiagnosticsList } from "../components/ide/DiagnosticsList";
import { TerminalPanel } from "../components/ide/TerminalPanel";
import { MetricCard } from "../components/ui/MetricCard";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ToolbarButton } from "../components/ui/ToolbarButton";
import { diagnostics, terminalEntries } from "../services/mockData";
import { useServices } from "../services/ServiceProvider";

export function ArtifactsPage() {
  const services = useServices();
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const [selectedId, setSelectedId] = useState("java");
  const [rerunState, setRerunState] = useState<"idle" | "running" | "complete">("complete");

  useEffect(() => {
    void services.artifacts.listArtifacts("portfolio-analysis").then(setArtifacts);
  }, [services]);

  const selected = useMemo(() => artifacts.find((artifact) => artifact.id === selectedId) ?? artifacts[0], [artifacts, selectedId]);

  function rerun() {
    setRerunState("running");
    window.setTimeout(() => setRerunState("complete"), 500);
  }

  return (
    <div className="screen-grid" style={{ gridTemplateColumns: "280px minmax(0, 1fr)", gridTemplateRows: "56px 1fr 230px" }}>
      <header style={{ gridColumn: "1 / 3", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-low)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <strong>BickSpec</strong>
          <span className="mono">portfolio-analysis.bks</span>
          <StatusBadge>{rerunState === "running" ? "Building" : "Build Successful"}</StatusBadge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ToolbarButton icon={<FolderOpen size={16} />}>Open Output Folder</ToolbarButton>
          <ToolbarButton icon={<Download size={16} />}>Export Report</ToolbarButton>
          <ToolbarButton primary icon={rerunState === "running" ? <RefreshCw size={16} /> : <Play size={16} />} onClick={rerun}>Re-run</ToolbarButton>
          <ToolbarButton icon={<ArrowLeft size={16} />}>Back to Editor</ToolbarButton>
        </div>
      </header>

      <aside className="side-panel">
        <div className="panel-header"><span className="label-caps">Artifacts</span></div>
        <ArtifactNavigator artifacts={artifacts} selectedId={selectedId} onSelect={(artifact) => setSelectedId(artifact.id)} />
      </aside>

      <main style={{ minWidth: 0, minHeight: 0, display: "grid", gridTemplateRows: "auto 1fr" }}>
        <section className="metric-grid" style={{ padding: 16 }}>
          <MetricCard label="Generated Files" value={String(artifacts.length || 5)} tone="accent" />
          <MetricCard label="Diagnostics" value="1 warning" tone="warn" />
          <MetricCard label="Compile Time" value="284ms" />
          <MetricCard label="Target" value="Java 21" />
        </section>
        <Panel title={selected?.name ?? "Artifact Preview"} action={<StatusBadge tone="neutral">{selected?.kind ?? "preview"}</StatusBadge>}>
          <pre className="artifact-preview">{selected?.preview ?? "Loading artifact preview..."}</pre>
        </Panel>
      </main>

      <section className="split-bottom" style={{ gridColumn: "1 / 3" }}>
        <Panel title="Build Log">
          <TerminalPanel entries={terminalEntries} />
        </Panel>
        <Panel title="Diagnostics">
          <DiagnosticsList diagnostics={diagnostics} />
        </Panel>
      </section>
    </div>
  );
}


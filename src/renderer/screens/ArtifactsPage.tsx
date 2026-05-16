import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Eye, FolderOpen, Play, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArtifactNavigator } from "../components/artifacts/ArtifactNavigator";
import { DiagnosticsList } from "../components/ide/DiagnosticsList";
import { TerminalPanel } from "../components/ide/TerminalPanel";
import { MetricCard } from "../components/ui/MetricCard";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ToolbarButton } from "../components/ui/ToolbarButton";
import { useStudioSession } from "../state/StudioSessionProvider";
import type { TerminalEntry } from "@shared/contracts/domain";

export function ArtifactsPage() {
  const navigate = useNavigate();
  const {
    artifacts,
    diagnostics,
    lastSession,
    isRunning,
    rerunLastTarget,
    openOutputFolder,
    exportSelectedArtifact,
    openArtifact,
    revealArtifact,
    readArtifactPreview
  } = useStudioSession();
  const [selectedId, setSelectedId] = useState(artifacts[0]?.id ?? "");
  const [preview, setPreview] = useState("No artifact selected.");

  const selected = useMemo(() => artifacts.find((artifact) => artifact.id === selectedId) ?? artifacts[0], [artifacts, selectedId]);

  useEffect(() => {
    if (!selected) {
      setPreview("No generated artifacts yet. Compile a BickSpec file to populate this view.");
      return;
    }
    setSelectedId(selected.id);
    void readArtifactPreview(selected.absolutePath).then(setPreview);
  }, [readArtifactPreview, selected]);

  return (
    <div className="screen-grid artifacts-page" style={{ gridTemplateColumns: "280px minmax(0, 1fr)", gridTemplateRows: "56px minmax(0, 1fr) 230px" }}>
      <header style={{ gridColumn: "1 / 3", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-low)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <strong>BickSpec</strong>
          <span className="mono">{lastSession?.summary.targetPath ?? "No compiler session"}</span>
          <StatusBadge tone={isRunning ? "neutral" : lastSession?.summary.success ? "success" : "warn"}>{isRunning ? "Building" : lastSession?.summary.success ? "Build Successful" : "No Successful Build"}</StatusBadge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ToolbarButton icon={<FolderOpen size={16} />} onClick={() => void openOutputFolder()}>Open Output Folder</ToolbarButton>
          <ToolbarButton icon={<Download size={16} />} onClick={() => void exportSelectedArtifact(selected?.absolutePath)}>Export Report</ToolbarButton>
          <ToolbarButton primary icon={isRunning ? <RefreshCw size={16} /> : <Play size={16} />} onClick={() => void rerunLastTarget()}>Re-run</ToolbarButton>
          <ToolbarButton icon={<ArrowLeft size={16} />} onClick={() => navigate("/workspace")}>Back to Editor</ToolbarButton>
        </div>
      </header>

      <aside className="side-panel">
        <div className="panel-header"><span className="label-caps">Artifacts</span></div>
        <ArtifactNavigator artifacts={artifacts} selectedId={selected?.id ?? ""} onSelect={(artifact) => setSelectedId(artifact.id)} />
      </aside>

      <main className="artifacts-main">
        <section className="metric-grid" style={{ padding: 16 }}>
          <MetricCard label="Generated Files" value={String(artifacts.length)} tone="accent" />
          <MetricCard label="Diagnostics" value={String(diagnostics.length)} tone={diagnostics.length ? "warn" : "default"} />
          <MetricCard label="Compile Time" value={lastSession ? `${lastSession.summary.durationMs}ms` : "-"} />
          <MetricCard label="Target" value={lastSession?.summary.targetKind ?? "-"} />
        </section>
        <Panel title={selected?.displayName ?? "Artifact Preview"} action={<StatusBadge tone="neutral">{selected?.type ?? "preview"}</StatusBadge>} className="artifact-preview-panel">
          <div style={{ display: "flex", gap: 8, padding: 12, borderBottom: "1px solid var(--color-outline-variant)" }}>
            <ToolbarButton icon={<Eye size={14} />} onClick={() => selected && void openArtifact(selected.absolutePath)}>Open</ToolbarButton>
            <ToolbarButton icon={<FolderOpen size={14} />} onClick={() => selected && void revealArtifact(selected.absolutePath)}>Reveal</ToolbarButton>
          </div>
          <div className="artifact-preview-scroll">
            <pre className="artifact-preview">{preview}</pre>
          </div>
        </Panel>
      </main>

      <section className="split-bottom" style={{ gridColumn: "1 / 3" }}>
        <Panel title="Build Log" className="bottom-results-panel">
          <TerminalPanel entries={toTerminalEntries(lastSession?.normalized.buildLog ?? "")} />
        </Panel>
        <Panel title="Diagnostics" className="bottom-results-panel">
          <DiagnosticsList diagnostics={diagnostics} />
        </Panel>
      </section>
    </div>
  );
}

function toTerminalEntries(output: string): TerminalEntry[] {
  if (!output) return [{ level: "info", text: "No compiler output yet." }];
  return output.split(/\r?\n/).filter(Boolean).map((text) => ({
    level: text.includes("[ERROR]") ? "error" : text.includes("[SUCCESS]") ? "success" : "info",
    text
  }));
}

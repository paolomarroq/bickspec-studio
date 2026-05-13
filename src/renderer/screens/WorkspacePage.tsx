import { BarChart3, Bug, GitBranch, MoreHorizontal, PackageCheck, Play, Save, Search, X } from "lucide-react";
import { CodeEditor } from "../components/ide/CodeEditor";
import { DiagnosticsList } from "../components/ide/DiagnosticsList";
import { FileTree } from "../components/ide/FileTree";
import { TerminalPanel } from "../components/ide/TerminalPanel";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ToolbarButton } from "../components/ui/ToolbarButton";
import { useStudioSession } from "../state/StudioSessionProvider";
import type { CompileDiagnostic, ProjectFile, TerminalEntry } from "@shared/contracts/domain";

export function WorkspacePage() {
  const {
    workspace,
    openTabs,
    activeFile,
    diagnostics,
    consoleOutput,
    artifacts,
    isRunning,
    setActiveFile,
    openWorkspaceFile,
    updateActiveFileContent,
    saveActiveFile,
    closeTab,
    runActiveFile
  } = useStudioSession();

  const files = (workspace?.fileTree ?? []) as ProjectFile[];
  const output = toTerminalEntries(consoleOutput);

  return (
    <div className="screen-grid" style={{ gridTemplateColumns: "260px minmax(520px, 1fr) 320px", gridTemplateRows: "1fr 230px" }}>
      <aside className="side-panel">
        <div className="panel-header">
          <span className="label-caps">Explorer</span>
          <MoreHorizontal size={16} />
        </div>
        <div style={{ padding: "12px 12px 4px" }}>
          <strong>{workspace?.workspaceName ?? "No folder open"}</strong>
          <div className="mono" style={{ color: "var(--color-text-muted)", fontSize: 12, marginTop: 3 }}>
            {workspace?.workspaceFolderPath ?? "Open a folder or .bks file to begin"}
          </div>
        </div>
        <FileTree
          files={files}
          selectedFileId={activeFile?.path ?? ""}
          onSelect={(file) => {
            if (file.kind !== "folder") void openWorkspaceFile(file.path);
          }}
        />
      </aside>

      <section style={{ minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--color-outline-variant)" }}>
        <div className="tabs">
          {openTabs.length === 0 ? (
            <button className="tab active">No file open</button>
          ) : openTabs.map((tab) => (
            <button className={`tab ${activeFile?.path === tab.path ? "active" : ""}`} key={tab.path} onClick={() => setActiveFile(tab.path)}>
              {tab.name}{tab.dirty ? " *" : ""}
              <X size={13} style={{ marginLeft: 8 }} onClick={(event) => {
                event.stopPropagation();
                closeTab(tab.path);
              }} />
            </button>
          ))}
          <span style={{ marginLeft: "auto", padding: "9px 12px" }}>
            <StatusBadge tone={isRunning ? "neutral" : "success"}>{isRunning ? "running" : "ready"}</StatusBadge>
          </span>
        </div>
        {activeFile ? (
          <CodeEditor content={activeFile.content} onChange={updateActiveFileContent} />
        ) : (
          <div style={{ padding: 24, color: "var(--color-text-muted)" }}>Open or create a BickSpec file to start editing.</div>
        )}
      </section>

      <aside style={{ minWidth: 0, minHeight: 0, overflow: "auto" }}>
        <Panel title="Context Inspector">
          <div style={{ padding: 16, display: "grid", gap: 14 }}>
            <div><span className="label-caps">Current File</span><strong style={{ display: "block" }}>{activeFile?.name ?? "None"}</strong></div>
            <div><span className="label-caps">Diagnostics</span><strong style={{ display: "block" }}>{diagnostics.length}</strong></div>
            <div><span className="label-caps">Artifacts</span><strong style={{ display: "block", color: "var(--color-teal)" }}>{artifacts.length} discovered</strong></div>
            <ToolbarButton icon={<Save size={16} />} onClick={() => void saveActiveFile()}>Save</ToolbarButton>
            <ToolbarButton primary icon={<Play size={16} />} onClick={() => void runActiveFile()}>Compile & Run</ToolbarButton>
          </div>
        </Panel>
        <Panel title="Outline">
          <div style={{ padding: 12, display: "grid", gap: 8 }}>
            {[
              [GitBranch, "workspace", workspace?.workspaceName ?? "not loaded"],
              [BarChart3, "artifacts", `${artifacts.length} files`],
              [Bug, "diagnostics", `${diagnostics.length} issues`],
              [PackageCheck, "session", isRunning ? "running" : "ready"]
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
          <DiagnosticsList diagnostics={diagnostics.map(toCompileDiagnostic)} />
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

function toCompileDiagnostic(diagnostic: { severity: "info" | "warning" | "error"; message: string; filePath?: string; line?: number; column?: number }): CompileDiagnostic {
  return {
    severity: diagnostic.severity,
    message: diagnostic.message,
    location: [diagnostic.filePath, diagnostic.line, diagnostic.column].filter(Boolean).join(":") || "compiler"
  };
}


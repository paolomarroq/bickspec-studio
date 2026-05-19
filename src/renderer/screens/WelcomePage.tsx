import { FilePlus2, FolderOpen, FileCode2, History } from "lucide-react";
import { Panel } from "../components/ui/Panel";
import { LauncherActionCard } from "../components/launcher/LauncherActionCard";
import { BrandLogo } from "../components/brand/BrandLogo";
import { useStudioSession } from "../state/StudioSessionProvider";

export function WelcomePage() {
  const { recentEntries, newFile, openFilePicker, openFolderPicker, reopenRecent } = useStudioSession();

  return (
    <div className="launcher-grid">
      <main className="page" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <section>
          <div style={{ display: "grid", gap: 18, alignItems: "flex-start" }}>
            <BrandLogo className="launcher-logo" />
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
          <LauncherActionCard to="/workspace" primary icon={<FilePlus2 />} title="New BickSpec File" description="Create a blank financial logic schema." onClick={() => void newFile()} />
          <LauncherActionCard to="/workspace" icon={<FileCode2 color="var(--color-teal)" />} title="Open .bks File" description="Open an existing single specification file." onClick={() => void openFilePicker()} />
          <LauncherActionCard to="/workspace" icon={<FolderOpen color="var(--color-teal)" />} title="Open Project Folder" description="Load a multi-file financial project." onClick={() => void openFolderPicker()} />
        </section>
      </main>

      <aside style={{ padding: 18, background: "var(--color-surface)", borderLeft: "1px solid var(--color-outline-variant)", overflow: "auto" }}>
        <Panel title="Recent Projects" action={<History size={16} />}>
          {recentEntries.length === 0 ? (
            <div style={{ padding: 14, color: "var(--color-text-muted)" }}>No recent BickSpec files or folders yet.</div>
          ) : recentEntries.map((project) => (
          <button key={project.id} className="recent-project-row" onClick={() => void reopenRecent(project.path)}>
            <span style={{ minWidth: 0 }}>
              <strong>{project.name}</strong>
              <span className="mono recent-project-path">{project.path}</span>
            </span>
            <span className="recent-project-time">{new Date(project.openedAt).toLocaleDateString()}</span>
          </button>
          ))}
        </Panel>
      </aside>
    </div>
  );
}

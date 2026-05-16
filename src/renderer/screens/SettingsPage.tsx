import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { StudioSettings, ThemeMode } from "@shared/contracts/domain";
import { SettingsGroup, SettingsRow } from "../components/settings/SettingsGroup";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ToolbarButton } from "../components/ui/ToolbarButton";
import { useServices } from "../services/ServiceProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useStudioSession } from "../state/StudioSessionProvider";

export function SettingsPage() {
  const services = useServices();
  const { theme, setTheme } = useTheme();
  const { setupState, openSetupWizard, refreshSetupState } = useStudioSession();
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [savedSettings, setSavedSettings] = useState<StudioSettings | null>(null);
  const [query, setQuery] = useState("");
  const [saveState, setSaveState] = useState<"ready" | "saved">("ready");

  useEffect(() => {
    void services.settings.getSettings().then((nextSettings) => {
      const loaded = { ...nextSettings, theme };
      setSettings(loaded);
      setSavedSettings(loaded);
    });
  }, [services]);

  function updateSetting<K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) {
    if (!settings) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    if (key === "theme") setTheme(value as ThemeMode);
  }

  async function saveSettings() {
    if (!settings) return;
    const saved = await services.settings.saveSettings(settings);
    setSavedSettings(saved);
    setSaveState("saved");
    window.setTimeout(() => setSaveState("ready"), 1800);
  }

  const normalizedQuery = query.trim().toLowerCase();
  const groups = useMemo(() => [
    {
      title: "General",
      rows: [
        {
          title: "Project launch behavior",
          description: "Choose what BickSpec Studio opens when the app starts.",
          content: <select className="field-control" defaultValue="recent" disabled title="Launcher behavior is fixed in this release."><option value="recent">Show launcher and recent projects</option></select>
        },
        {
          title: "Auto-save BickSpec documents",
          description: "Persist editor changes before compile and export actions.",
          content: <button className={`toggle ${settings?.autoSave ? "on" : ""}`} onClick={() => updateSetting("autoSave", !settings?.autoSave)} aria-label="Toggle auto-save" />
        }
      ]
    },
    {
      title: "Editor",
      rows: [
        {
          title: "Editor font",
          description: "Use IBM Plex Mono for BickSpec source, generated code, and technical outputs.",
          content: <select className="field-control" defaultValue="ibm-plex-mono" disabled title="IBM Plex Mono is the fixed editor font."><option value="ibm-plex-mono">IBM Plex Mono</option></select>
        },
        {
          title: "Show line numbers",
          description: "Keep source files aligned for specification review and diagnostics.",
          content: <button className="toggle on" aria-label="Show line numbers" disabled title="Line numbers are always enabled." />
        }
      ]
    },
    {
      title: "Compiler",
      rows: [
        {
          title: "Compiler channel",
          description: "Preserved as the future backend selection boundary.",
          content: <select className="field-control" value={settings?.compilerChannel ?? "stable"} onChange={(event) => updateSetting("compilerChannel", event.target.value as "stable" | "preview")}><option value="stable">stable</option><option value="preview">preview</option></select>
        },
        {
          title: "Compiler adapter path",
          description: "Prepared for the real compiler repository integration.",
          content: <input className="field-control mono" value="local://bickspec-compiler" readOnly />
        },
        {
          title: "Open Setup Wizard",
          description: "Re-run Java, compiler, workspace, artifact, and report validation.",
          content: <ToolbarButton onClick={openSetupWizard}>Open Setup Wizard</ToolbarButton>
        },
        {
          title: "Configured Java path",
          description: "Java executable selected during setup.",
          content: <input className="field-control mono" value={setupState?.javaPath ?? "java"} readOnly />
        },
        {
          title: "Compiler repository",
          description: "Linked local bickspec-lang repository root.",
          content: <input className="field-control mono" value={setupState?.compilerRepoPath ?? "Not configured"} readOnly />
        },
        {
          title: "Compiler JAR",
          description: "Compiler artifact used by Studio.",
          content: <input className="field-control mono" value={setupState?.compilerJarPath ?? "Not configured"} readOnly />
        },
        {
          title: "Setup workspace",
          description: "Workspace validated by the setup wizard.",
          content: <input className="field-control mono" value={setupState?.workspacePath ?? "Not configured"} readOnly />
        },
        {
          title: "Reset Setup",
          description: "Clear setup configuration only; project files stay untouched.",
          content: <ToolbarButton onClick={() => void window.bickspecStudio?.backend.resetSetup().then(() => refreshSetupState())}>Reset Setup</ToolbarButton>
        }
      ]
    },
    {
      title: "Output",
      rows: [
        {
          title: "Default artifact location",
          description: "Generated Java, reports, and data tables are staged inside the active project.",
          content: <input className="field-control mono" value="./generated" readOnly />
        },
        {
          title: "Open results after compile",
          description: "Editor runs now stay in the workspace; results remain available from the Artifacts view.",
          content: <button className="toggle" aria-label="Open results after compile" disabled title="Editor runs stay in the workspace." />
        }
      ]
    },
    {
      title: "Appearance",
      rows: [
        {
          title: "Theme",
          description: "Spec Grid light and dark themes use separate tokens, not simple inversion.",
          content: <div className="theme-options" role="group" aria-label="Theme">{([["light", "Light"], ["dark", "Dark"], ["system", "System"]] as const).map(([value, label]) => <button className={`theme-option ${theme === value ? "selected" : ""}`} key={value} onClick={() => updateSetting("theme", value)}>{label}</button>)}</div>
        },
        {
          title: "Technical density",
          description: "Keep panels compact for financial engineering workflows.",
          content: <select className="field-control" defaultValue="standard" disabled title="Standard Spec Grid density is fixed in this release."><option value="standard">Standard Spec Grid</option></select>
        }
      ]
    }
  ], [openSetupWizard, refreshSetupState, settings, setupState, theme]);

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) => [group.title, row.title, row.description].join(" ").toLowerCase().includes(normalizedQuery))
    }))
    .filter((group) => group.rows.length > 0);
  const aboutMatches = !normalizedQuery || "about bickspec studio desktop ide ui layer".includes(normalizedQuery);
  const hasUnsavedChanges = Boolean(settings && savedSettings && JSON.stringify(settings) !== JSON.stringify(savedSettings));

  return (
    <div className="screen-grid" style={{ gridTemplateRows: "52px 1fr" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-low)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <strong>BickSpec Studio Settings</strong>
          <StatusBadge tone="neutral">{saveState === "saved" ? "Saved" : hasUnsavedChanges ? "Unsaved" : "Ready"}</StatusBadge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label className="field-control" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={15} />
            <input className="settings-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search settings..." />
          </label>
          <ToolbarButton onClick={() => void saveSettings()} disabled={!hasUnsavedChanges}>Save</ToolbarButton>
        </div>
      </header>

      <main className="settings-canvas">
        <div style={{ maxWidth: 980, display: "grid", gap: 18 }}>
          <section className="settings-intro panel">
            <div>
              <span className="label-caps">Configuration</span>
              <h1>BickSpec Studio Settings</h1>
              <p>UI preferences, compiler handoff points, and output defaults are grouped in a single reviewable surface.</p>
            </div>
            <StatusBadge tone="neutral">Persistence: Local</StatusBadge>
          </section>
          <section className="settings-category-strip" aria-label="Settings categories">
            {["General", "Editor", "Compiler", "Output", "Appearance", "About"].map((category) => (
              <span className="label-caps" key={category}>{category}</span>
            ))}
          </section>
          {visibleGroups.length === 0 && !aboutMatches ? <div className="panel settings-empty">No settings found.</div> : visibleGroups.map((group) => (
            <SettingsGroup title={group.title} key={group.title}>
              {group.rows.map((row) => <SettingsRow title={row.title} description={row.description} key={row.title}>{row.content}</SettingsRow>)}
            </SettingsGroup>
          ))}

          {aboutMatches ? (
            <Panel title="About BickSpec Studio">
              <div style={{ padding: 16, color: "var(--color-text-muted)" }}>
                Desktop IDE UI layer for BickSpec financial specifications. Backend compiler integration is prepared through the local service boundary.
              </div>
            </Panel>
          ) : null}
        </div>
      </main>
    </div>
  );
}

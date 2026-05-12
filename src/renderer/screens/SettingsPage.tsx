import { useEffect, useState } from "react";
import { Code2, Info, Palette, Search, SlidersHorizontal, TerminalSquare, Upload } from "lucide-react";
import type { StudioSettings } from "@shared/contracts/domain";
import { SettingsGroup, SettingsRow } from "../components/settings/SettingsGroup";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ToolbarButton } from "../components/ui/ToolbarButton";
import { useServices } from "../services/ServiceProvider";
import { useTheme } from "../theme/ThemeProvider";

const categories = [
  { label: "General", icon: SlidersHorizontal },
  { label: "Editor", icon: Code2 },
  { label: "Compiler", icon: TerminalSquare },
  { label: "Output", icon: Upload },
  { label: "Appearance", icon: Palette },
  { label: "About", icon: Info }
];

export function SettingsPage() {
  const services = useServices();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [activeCategory, setActiveCategory] = useState("General");

  useEffect(() => {
    void services.settings.getSettings().then((nextSettings) => setSettings({ ...nextSettings, theme }));
  }, [services, theme]);

  function updateSetting<K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) {
    if (!settings) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    if (key === "theme") setTheme(value as "light" | "dark");
    void services.settings.saveSettings(next);
  }

  return (
    <div className="screen-grid" style={{ gridTemplateColumns: "260px minmax(0, 1fr)", gridTemplateRows: "52px 1fr" }}>
      <header style={{ gridColumn: "1 / 3", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-low)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <strong>BickSpec Settings</strong>
          <StatusBadge tone="neutral">UI-only mock</StatusBadge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="field-control" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={15} />
            <span style={{ color: "var(--color-text-muted)" }}>Search settings...</span>
          </div>
          <ToolbarButton>Save</ToolbarButton>
        </div>
      </header>

      <aside className="side-panel">
        <div className="panel-header"><span className="label-caps">Categories</span></div>
        <nav style={{ padding: 12, display: "grid", gap: 6 }}>
          {categories.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-row ${activeCategory === label ? "active" : ""}`} onClick={() => setActiveCategory(label)}>
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ padding: 24, overflow: "auto" }}>
        <div style={{ maxWidth: 920, display: "grid", gap: 18 }}>
          <SettingsGroup title="General">
            <SettingsRow title="Project launch behavior" description="Choose what BickSpec Studio opens when the app starts.">
              <select className="field-control" defaultValue="recent">
                <option value="recent">Show launcher and recent projects</option>
                <option value="last">Restore last workspace</option>
              </select>
            </SettingsRow>
            <SettingsRow title="Auto-save BickSpec documents" description="Persist editor changes before compile and export actions.">
              <button className={`toggle ${settings?.autoSave ? "on" : ""}`} onClick={() => updateSetting("autoSave", !settings?.autoSave)} aria-label="Toggle auto-save" />
            </SettingsRow>
          </SettingsGroup>

          <SettingsGroup title="Compiler">
            <SettingsRow title="Compiler channel" description="Mocked now, but preserved as the future backend selection boundary.">
              <select className="field-control" value={settings?.compilerChannel ?? "stable"} onChange={(event) => updateSetting("compilerChannel", event.target.value as "stable" | "preview")}>
                <option value="stable">stable</option>
                <option value="preview">preview</option>
              </select>
            </SettingsRow>
            <SettingsRow title="Compiler adapter path" description="Prepared for the real compiler repository integration.">
              <input className="field-control mono" value="mock://bickspec-compiler" readOnly />
            </SettingsRow>
          </SettingsGroup>

          <SettingsGroup title="Appearance">
            <SettingsRow title="Theme" description="Spec Grid light and dark themes use separate tokens, not simple inversion.">
              <select className="field-control" value={theme} onChange={(event) => updateSetting("theme", event.target.value as "light" | "dark")}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </SettingsRow>
            <SettingsRow title="Technical density" description="Keep panels compact for financial engineering workflows.">
              <select className="field-control" defaultValue="standard">
                <option value="standard">Standard Spec Grid</option>
                <option value="dense">Dense</option>
              </select>
            </SettingsRow>
          </SettingsGroup>

          <Panel title="About BickSpec Studio">
            <div style={{ padding: 16, color: "var(--color-text-muted)" }}>
              Desktop IDE UI layer for BickSpec financial specifications. Backend compiler integration is intentionally mocked in this phase.
            </div>
          </Panel>
        </div>
      </main>
    </div>
  );
}


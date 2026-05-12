import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { StudioSettings } from "@shared/contracts/domain";
import { SettingsGroup, SettingsRow } from "../components/settings/SettingsGroup";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ToolbarButton } from "../components/ui/ToolbarButton";
import { useServices } from "../services/ServiceProvider";
import { useTheme } from "../theme/ThemeProvider";

export function SettingsPage() {
  const services = useServices();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<StudioSettings | null>(null);

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
    <div className="screen-grid" style={{ gridTemplateRows: "52px 1fr" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-low)" }}>
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

      <main className="settings-canvas">
        <div style={{ maxWidth: 980, display: "grid", gap: 18 }}>
          <section className="settings-intro panel">
            <div>
              <span className="label-caps">Configuration</span>
              <h1>Studio Settings</h1>
              <p>UI preferences, mock compiler handoff points, and output defaults are grouped in a single reviewable surface.</p>
            </div>
            <StatusBadge tone="neutral">mock persistence</StatusBadge>
          </section>
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

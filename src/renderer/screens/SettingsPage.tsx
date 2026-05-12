import { useTheme } from "../theme/ThemeProvider";
import { Panel } from "../components/ui/Panel";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
      <Panel title="Settings">
        <nav style={{ display: "grid", padding: 8 }}>
          {["Appearance", "Compiler", "Artifacts", "Reports", "Advanced"].map((item, index) => (
            <button key={item} className={`tab ${index === 0 ? "active" : ""}`} style={{ textAlign: "left" }}>{item}</button>
          ))}
        </nav>
      </Panel>
      <div className="grid-page">
        <Panel title="Appearance">
          <div style={{ padding: 16, display: "grid", gap: 16 }}>
            <label>
              <span className="label-caps">Theme</span>
              <select className="button" value={theme} onChange={(event) => setTheme(event.target.value as "light" | "dark")} style={{ display: "block", marginTop: 8 }}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label><input type="checkbox" defaultChecked /> Auto-save BickSpec documents</label>
            <label><input type="checkbox" /> Enable anonymous UI diagnostics</label>
          </div>
        </Panel>
        <Panel title="Future Compiler Integration">
          <div style={{ padding: 16, display: "grid", gap: 12 }}>
            <label><span className="label-caps">Compiler Channel</span><select className="button" defaultValue="stable"><option>stable</option><option>preview</option></select></label>
            <label><span className="label-caps">Compiler Path</span><input className="button mono" value="mock://bickspec-compiler" readOnly /></label>
          </div>
        </Panel>
      </div>
    </div>
  );
}


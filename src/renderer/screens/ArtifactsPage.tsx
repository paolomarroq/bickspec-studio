import { Download, Eye, FolderOpen } from "lucide-react";
import { MetricCard } from "../components/ui/MetricCard";
import { Panel } from "../components/ui/Panel";
import { generatedArtifacts } from "../services/mockData";

export function ArtifactsPage() {
  return (
    <div className="page grid-page">
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <MetricCard label="Generated Files" value="4" tone="accent" />
        <MetricCard label="Diagnostics" value="1" tone="warn" />
        <MetricCard label="Compile Time" value="284ms" />
        <MetricCard label="Backend" value="Mock" />
      </section>
      <Panel title="Generated Artifacts" action={<button className="button primary"><Download size={16} /> Export Bundle</button>}>
        <div style={{ display: "grid" }}>
          {generatedArtifacts.map((artifact) => (
            <div key={artifact.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 140px", alignItems: "center", padding: 14, borderBottom: "1px solid var(--color-outline-variant)" }}>
              <strong>{artifact.name}</strong>
              <span className="label-caps">{artifact.kind}</span>
              <span className="mono">{artifact.size}</span>
              <span style={{ display: "flex", gap: 8 }}>
                <button className="button"><Eye size={14} /></button>
                <button className="button"><FolderOpen size={14} /></button>
              </span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Compile Log">
        <pre className="mono" style={{ padding: 16, margin: 0, color: "var(--color-text-muted)" }}>
{`[mock] compile started
[mock] validation graph resolved
[mock] java, json, pdf, csv artifacts created
[mock] ready for future compiler service handoff`}
        </pre>
      </Panel>
    </div>
  );
}


export function MetricCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "accent" | "warn" }) {
  const color = tone === "accent" ? "var(--color-teal)" : tone === "warn" ? "var(--color-amber)" : "var(--color-text)";
  return (
    <div className="panel" style={{ padding: 16 }}>
      <div className="label-caps">{label}</div>
      <div style={{ marginTop: 10, color, fontSize: 28, fontWeight: 800 }}>{value}</div>
    </div>
  );
}


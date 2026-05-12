import type { TerminalEntry } from "@shared/contracts/domain";

export function TerminalPanel({ entries }: { entries: TerminalEntry[] }) {
  return (
    <pre className="mono" style={{ margin: 0, padding: 14, fontSize: 12, lineHeight: "20px", color: "var(--color-text-muted)" }}>
      {entries.map((entry, index) => (
        <span className={`terminal-line ${entry.level}`} key={`${entry.level}-${index}`}>
          {entry.text}
        </span>
      ))}
    </pre>
  );
}


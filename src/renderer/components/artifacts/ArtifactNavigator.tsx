import { Code2, FileJson, FileText, Table2 } from "lucide-react";
import type { GeneratedArtifactMetadata } from "@shared/contracts/backend";
import { StatusBadge } from "../ui/StatusBadge";

const iconMap = {
  java: Code2,
  json: FileJson,
  pdf: FileText,
  csv: Table2,
  excel: Table2,
  class: Code2,
  symbols: Table2,
  "tree-svg": FileText,
  "tree-dot": FileText,
  summary: FileText,
  log: FileText,
  report: FileText,
  other: FileText
};

export function ArtifactNavigator({
  artifacts,
  selectedId,
  onSelect
}: {
  artifacts: GeneratedArtifactMetadata[];
  selectedId: string;
  onSelect: (artifact: GeneratedArtifactMetadata) => void;
}) {
  return (
    <nav style={{ padding: 10, display: "grid", gap: 6 }}>
      {artifacts.map((artifact) => {
        const Icon = iconMap[artifact.type] ?? FileText;
        return (
          <button
            className={`artifact-row ${selectedId === artifact.id ? "active" : ""}`}
            key={artifact.id}
            onClick={() => onSelect(artifact)}
            style={{ alignItems: "flex-start", flexDirection: "column" }}
          >
            <span style={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 8 }}>
              <span className="label-caps">{artifact.type}</span>
              <StatusBadge tone={artifact.exists ? "neutral" : "warn"}>{artifact.exists ? "ready" : "missing"}</StatusBadge>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <Icon size={17} color="var(--color-teal)" />
              <span className="mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{artifact.displayName}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

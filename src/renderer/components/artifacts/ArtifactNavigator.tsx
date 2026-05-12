import { Code2, FileJson, FileText, Table2 } from "lucide-react";
import type { GeneratedArtifact } from "@shared/contracts/domain";
import { StatusBadge } from "../ui/StatusBadge";

const iconMap = {
  java: Code2,
  json: FileJson,
  pdf: FileText,
  csv: Table2,
  excel: Table2
};

export function ArtifactNavigator({
  artifacts,
  selectedId,
  onSelect
}: {
  artifacts: GeneratedArtifact[];
  selectedId: string;
  onSelect: (artifact: GeneratedArtifact) => void;
}) {
  return (
    <nav style={{ padding: 10, display: "grid", gap: 6 }}>
      {artifacts.map((artifact) => {
        const Icon = iconMap[artifact.kind];
        return (
          <button
            className={`artifact-row ${selectedId === artifact.id ? "active" : ""}`}
            key={artifact.id}
            onClick={() => onSelect(artifact)}
            style={{ alignItems: "flex-start", flexDirection: "column" }}
          >
            <span style={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 8 }}>
              <span className="label-caps">{artifact.label ?? artifact.kind}</span>
              <StatusBadge tone={artifact.status === "stale" ? "warn" : "neutral"}>{artifact.status ?? "ready"}</StatusBadge>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <Icon size={17} color="var(--color-teal)" />
              <span className="mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{artifact.name}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}


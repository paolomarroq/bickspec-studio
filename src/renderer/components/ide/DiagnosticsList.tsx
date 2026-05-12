import type { CompileDiagnostic } from "@shared/contracts/domain";
import { StatusBadge } from "../ui/StatusBadge";

export function DiagnosticsList({ diagnostics }: { diagnostics: CompileDiagnostic[] }) {
  return (
    <div>
      {diagnostics.map((diagnostic) => (
        <div className="diagnostic-item" key={`${diagnostic.location}-${diagnostic.message}`}>
          <StatusBadge tone={diagnostic.severity === "warning" ? "warn" : diagnostic.severity === "error" ? "warn" : "neutral"}>
            {diagnostic.severity}
          </StatusBadge>
          <div>
            <strong style={{ display: "block" }}>{diagnostic.message}</strong>
            <span className="mono" style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{diagnostic.location}</span>
          </div>
        </div>
      ))}
    </div>
  );
}


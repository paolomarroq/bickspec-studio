import type { CompilerDiagnostic } from "@shared/contracts/backend";
import { Braces, CircleAlert, FileWarning, Hammer, Hash, Link2, PlayCircle, WandSparkles } from "lucide-react";
import { diagnosticLabels } from "@shared/diagnostics/diagnosticTypes";

export function DiagnosticsList({ diagnostics }: { diagnostics: CompilerDiagnostic[] }) {
  if (diagnostics.length === 0) {
    return <div className="session-output-empty">No errors detected.</div>;
  }

  return (
    <div>
      {diagnostics.map((diagnostic) => (
        <div className={`diagnostic-item diagnostic-${diagnostic.category.toLowerCase()}`} key={`${diagnostic.code}-${diagnostic.message}`}>
          <div className="diagnostic-kind">
            {getIcon(diagnostic.category)}
            <span>{diagnosticLabels[diagnostic.category]}</span>
          </div>
          <div>
            <strong style={{ display: "block" }}><span className="mono diagnostic-code">{diagnostic.code}</span>{diagnostic.message}</strong>
            <span className="mono" style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
              {[diagnostic.filePath, diagnostic.line, diagnostic.column].filter(Boolean).join(":") || diagnostic.stage || "compiler"}
            </span>
            {diagnostic.suggestion ? <span className="diagnostic-suggestion">{diagnostic.suggestion}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function getIcon(category: CompilerDiagnostic["category"]) {
  switch (category) {
    case "LEX":
      return <Hash size={16} />;
    case "SYN":
      return <Braces size={16} />;
    case "SEM":
      return <CircleAlert size={16} />;
    case "GEN":
      return <WandSparkles size={16} />;
    case "BUILD":
      return <Hammer size={16} />;
    case "EXECUTION":
      return <PlayCircle size={16} />;
    case "FS":
      return <FileWarning size={16} />;
    case "LINK":
      return <Link2 size={16} />;
    default:
      return <CircleAlert size={16} />;
  }
}

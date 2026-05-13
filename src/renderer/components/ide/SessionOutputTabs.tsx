import { useMemo, useState } from "react";
import type { CompilerDiagnostic, CompilerSessionResult } from "@shared/contracts/backend";
import type { CompileDiagnostic, TerminalEntry } from "@shared/contracts/domain";
import { DiagnosticsList } from "./DiagnosticsList";
import { TerminalPanel } from "./TerminalPanel";

type SessionOutputTab = "interactive" | "program" | "errors" | "build";

export function SessionOutputTabs({
  session,
  consoleOutput,
  diagnostics,
  isRunning
}: {
  session: CompilerSessionResult | null;
  consoleOutput: string;
  diagnostics: CompilerDiagnostic[];
  isRunning: boolean;
}) {
  const [activeTab, setActiveTab] = useState<SessionOutputTab>("program");
  const programOutput = useMemo(() => getProgramOutput(session), [session]);
  const interactiveOutput = useMemo(() => getInteractiveOutput(session, consoleOutput), [consoleOutput, session]);
  const buildEntries = useMemo(() => toTerminalEntries(consoleOutput || session?.output.find((block) => block.stream === "combined")?.text || ""), [consoleOutput, session]);
  const diagnosticItems = diagnostics.map(toCompileDiagnostic);

  const tabs: Array<{ id: SessionOutputTab; label: string; count?: number; relevant?: boolean }> = [
    { id: "interactive", label: "Interactive", relevant: Boolean(session?.summary.interactive) || isRunning },
    { id: "program", label: "Program Output", count: programOutput ? programOutput.split(/\r?\n/).length : 0, relevant: Boolean(programOutput) },
    { id: "errors", label: "Errors", count: diagnostics.length, relevant: diagnostics.length > 0 },
    { id: "build", label: "Build Log", count: buildEntries.length, relevant: buildEntries.length > 0 && buildEntries[0]?.text !== "No compiler output yet." }
  ];

  return (
    <section className="session-output-panel">
      <div className="session-output-tabs" role="tablist" aria-label="Session output">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`session-output-tab ${activeTab === tab.id ? "active" : ""} ${tab.relevant ? "relevant" : ""}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {typeof tab.count === "number" ? <span className="session-output-count">{tab.count}</span> : null}
          </button>
        ))}
      </div>

      <div className="session-output-content" role="tabpanel">
        {activeTab === "interactive" ? (
          <InteractivePane session={session} output={interactiveOutput} isRunning={isRunning} />
        ) : activeTab === "program" ? (
          programOutput ? <pre className="session-output-pre">{programOutput}</pre> : <EmptyPane message="No runtime output has been produced yet." />
        ) : activeTab === "errors" ? (
          diagnosticItems.length > 0 ? <DiagnosticsList diagnostics={diagnosticItems} /> : <EmptyPane message="No compiler diagnostics or runtime errors for the latest session." />
        ) : (
          <TerminalPanel entries={buildEntries} />
        )}
      </div>
    </section>
  );
}

function InteractivePane({ session, output, isRunning }: { session: CompilerSessionResult | null; output: string; isRunning: boolean }) {
  const isInteractive = Boolean(session?.summary.interactive);

  return (
    <div className="interactive-pane">
      <div className="interactive-transcript">
        {output ? <pre className="session-output-pre">{output}</pre> : <EmptyPane message={isRunning ? "Waiting for interactive runtime output..." : "No interactive session is active."} />}
      </div>
      <form className="interactive-input-row" onSubmit={(event) => event.preventDefault()}>
        <input
          className="interactive-input"
          disabled={!isInteractive || !isRunning}
          placeholder={isInteractive && !isRunning ? "Interactive process ended before a live input channel was available." : "Type input for the active interactive session"}
        />
        <button className="button" disabled={!isInteractive || !isRunning}>Send</button>
      </form>
    </div>
  );
}

function EmptyPane({ message }: { message: string }) {
  return <div className="session-output-empty">{message}</div>;
}

function getProgramOutput(session: CompilerSessionResult | null): string {
  if (!session) return "";
  const stdout = session.execution.stdout;
  const executionTaggedLines = session.execution.parsedOutput.lines
    .filter((line) => line.tag === "EXECUTION" || line.tag === "SUCCESS")
    .map((line) => line.message)
    .filter(Boolean);

  if (executionTaggedLines.length > 0) return executionTaggedLines.join("\n");

  return stdout
    .split(/\r?\n/)
    .filter((line) => !/^\[(STATUS|ERROR|SYMBOLS|TREE|JAVA|BUILD|SUCCESS)\]/.test(line.trim()))
    .join("\n")
    .trim();
}

function getInteractiveOutput(session: CompilerSessionResult | null, consoleOutput: string): string {
  if (!session?.summary.interactive) return "";
  return [session.execution.stdout, session.execution.stderr || session.execution.error, consoleOutput]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function toTerminalEntries(output: string): TerminalEntry[] {
  if (!output) return [{ level: "info", text: "No compiler output yet." }];
  return output.split(/\r?\n/).filter(Boolean).map((text) => ({
    level: text.includes("[ERROR]") ? "error" : text.includes("[SUCCESS]") ? "success" : text.includes("warning") ? "warning" : "info",
    text
  }));
}

function toCompileDiagnostic(diagnostic: CompilerDiagnostic): CompileDiagnostic {
  return {
    severity: diagnostic.severity,
    message: diagnostic.message,
    location: [diagnostic.filePath, diagnostic.line, diagnostic.column].filter(Boolean).join(":") || diagnostic.stage || "compiler"
  };
}

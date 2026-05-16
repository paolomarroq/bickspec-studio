import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CompilerDiagnostic, CompilerSessionResult, InteractiveSessionState } from "@shared/contracts/backend";
import type { TerminalEntry } from "@shared/contracts/domain";
import { DiagnosticsList } from "./DiagnosticsList";
import { TerminalPanel } from "./TerminalPanel";
import { formatRuntimeOutputText } from "../../utils/formatRuntimeOutput";

type SessionOutputTab = "interactive" | "program" | "errors" | "build";

export function SessionOutputTabs({
  session,
  diagnostics,
  isRunning,
  interactiveSession,
  onSendInteractiveInput
}: {
  session: CompilerSessionResult | null;
  diagnostics: CompilerDiagnostic[];
  isRunning: boolean;
  interactiveSession: InteractiveSessionState;
  onSendInteractiveInput(input: string): Promise<boolean>;
}) {
  const [activeTab, setActiveTab] = useState<SessionOutputTab>("program");
  const programOutput = formatRuntimeOutputText(session?.normalized.programOutput ?? "");
  const buildEntries = useMemo(() => toTerminalEntries(session?.normalized.buildLog ?? ""), [session]);

  const tabs: Array<{ id: SessionOutputTab; label: string; count?: number; relevant?: boolean }> = [
    { id: "interactive", label: "Interactive", relevant: interactiveSession.active || Boolean(session?.summary.interactive) || isRunning },
    { id: "program", label: "Program Output", count: programOutput ? programOutput.split(/\r?\n/).length : 0, relevant: Boolean(programOutput) },
    { id: "errors", label: "Errors", count: diagnostics.length, relevant: diagnostics.length > 0 },
    { id: "build", label: "Build Log", count: buildEntries.length, relevant: buildEntries.length > 0 && buildEntries[0]?.text !== "No compiler output yet." }
  ];

  useEffect(() => {
    if (interactiveSession.active) setActiveTab("interactive");
  }, [interactiveSession.active]);

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
          <InteractivePane isRunning={isRunning} interactiveSession={interactiveSession} onSend={onSendInteractiveInput} />
        ) : activeTab === "program" ? (
          programOutput ? <pre className="session-output-pre">{programOutput}</pre> : <EmptyPane message="No program output." />
        ) : activeTab === "errors" ? (
          diagnostics.length > 0 ? <DiagnosticsList diagnostics={diagnostics} /> : <EmptyPane message="No errors detected." />
        ) : (
          <TerminalPanel entries={buildEntries} />
        )}
      </div>
    </section>
  );
}

function InteractivePane({
  isRunning,
  interactiveSession,
  onSend
}: {
  isRunning: boolean;
  interactiveSession: InteractiveSessionState;
  onSend(input: string): Promise<boolean>;
}) {
  const [input, setInput] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [interactiveSession.entries.length, interactiveSession.status]);

  return (
    <div className="interactive-pane">
      <div className="interactive-transcript" ref={transcriptRef}>
        {interactiveSession.entries.length > 0 ? (
          <div className="interactive-messages">
            {interactiveSession.entries.map((entry) => (
              <div className={`interactive-message ${entry.speaker}`} key={entry.id}>
                <span className="interactive-speaker">{entry.speaker === "program" ? "BickSpec Program" : "You"}</span>
                <pre>{entry.speaker === "program" ? formatRuntimeOutputText(entry.text) : entry.text}</pre>
              </div>
            ))}
            <div className="interactive-status">
              {interactiveSession.status === "waiting"
                ? "Waiting for input..."
                : interactiveSession.status === "completed"
                  ? "Interactive session completed."
                  : null}
            </div>
            <div ref={endRef} />
          </div>
        ) : (
          <EmptyPane message={isRunning ? "Waiting for interactive runtime output..." : "No interactive session is active. Run a BickSpec program with READ to start one."} />
        )}
      </div>
      <form className="interactive-input-row" onSubmit={(event) => {
        event.preventDefault();
        if (!interactiveSession.active || !input.trim()) return;
        void onSend(input).then((sent) => {
          if (sent) setInput("");
        });
      }}>
        <textarea
          className="interactive-input"
          disabled={!interactiveSession.active}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={interactiveSession.active ? "Type input for the running program..." : "No active interactive session"}
          rows={1}
        />
        <button className="button" disabled={!interactiveSession.active || !input.trim()}>Send</button>
      </form>
    </div>
  );
}

function EmptyPane({ message }: { message: string }) {
  return <div className="session-output-empty">{message}</div>;
}

function toTerminalEntries(output: string): TerminalEntry[] {
  if (!output) return [{ level: "info", text: "No compiler output yet." }];
  return output.split(/\r?\n/).filter(Boolean).map((text) => ({
    level: text.includes("[ERROR]") ? "error" : text.includes("[SUCCESS]") ? "success" : text.includes("warning") ? "warning" : "info",
    text
  }));
}

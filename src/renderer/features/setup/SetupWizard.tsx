import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDot, FolderOpen, Play, RotateCcw, TerminalSquare } from "lucide-react";
import type { SetupValidationResult } from "@shared/contracts/backend";
import type { SetupCompilationResult } from "@shared/contracts/setup";
import { BrandLogo } from "../../components/brand/BrandLogo";
import { useStudioSession } from "../../state/StudioSessionProvider";
import "./setupWizard.css";

const steps = [
  "Welcome",
  "Java Runtime",
  "Compiler Repository",
  "Compiler JAR",
  "Workspace",
  "Run Test",
  "Interactive Mode",
  "Artifacts & Reports",
  "Ready"
] as const;

export function SetupWizard() {
  const bridge = window.bickspecStudio?.backend;
  const { setupState, setupWizardOpen, closeSetupWizard, refreshSetupState, workspace, interactiveSession, sendInteractiveInput, openFolderPicker, newFile, openDocumentation } = useStudioSession();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [compilation, setCompilation] = useState<SetupCompilationResult | null>(null);
  const [interactiveInput, setInteractiveInput] = useState("");

  useEffect(() => {
    if (!setupWizardOpen) {
      setStep(0);
      setMessage("");
    }
  }, [setupWizardOpen]);

  const checks = setupState?.lastValidationResults ?? {};
  const currentCheck = useMemo(() => {
    switch (step) {
      case 1: return checks.java;
      case 2: return checks.compilerRepo;
      case 3: return checks.compilerJar;
      case 4: return checks.workspace;
      case 5: return checks.compilation;
      case 6: return checks.interactive;
      case 7: return checks.artifacts;
      default: return undefined;
    }
  }, [checks, step]);

  if (!setupWizardOpen || !bridge) return null;
  const backend = bridge;

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      await refreshSetupState();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function chooseRepo() {
    await run(async () => {
      const selected = await backend.selectCompilerRepo();
      if (selected) await backend.validateCompilerRepo(selected);
    });
  }

  async function cloneRepo() {
    await run(() => backend.cloneCompilerRepo());
  }

  async function chooseJar() {
    await run(async () => {
      const selected = await backend.selectCompilerJar();
      if (selected) await backend.validateCompilerJar(selected);
    });
  }

  async function chooseWorkspace() {
    await run(async () => {
      const selected = await backend.selectWorkspace();
      if (selected) await backend.validateWorkspace(selected);
    });
  }

  async function useCurrentWorkspace() {
    await run(async () => {
      if (!workspace?.workspaceFolderPath) {
        setMessage("No current workspace is open yet.");
        return;
      }
      await backend.saveSetupState({ workspacePath: workspace.workspaceFolderPath });
      await backend.validateWorkspace(workspace.workspaceFolderPath);
    });
  }

  async function sendWizardInput() {
    if (!interactiveInput.trim()) return;
    await sendInteractiveInput(interactiveInput);
    setInteractiveInput("");
  }

  async function closeSetupAndOpenDocs(action: () => Promise<unknown>) {
    await run(async () => {
      await action();
      await backend.saveSetupState({ documentationShown: true });
      await openDocumentation();
      closeSetupWizard();
    });
  }

  function canContinue() {
    if ([0, 8].includes(step)) return true;
    if (step === 6) return currentCheck?.status === "success" || currentCheck?.status === "warning";
    return currentCheck?.status === "success" || currentCheck?.status === "warning";
  }

  return (
    <div className="setup-wizard-backdrop" role="dialog" aria-modal="true" aria-label="BickSpec Studio Setup Wizard">
      <section className="setup-wizard-shell">
        <aside className="setup-wizard-rail">
          <BrandLogo variant="icon" className="setup-wizard-mark" />
          <div>
            <span className="label-caps">First-run setup</span>
            <h2>BickSpec Studio</h2>
          </div>
          <ol>
            {steps.map((label, index) => (
              <li className={index === step ? "active" : index < step ? "done" : ""} key={label}>
                {index < step ? <CheckCircle2 size={16} /> : <CircleDot size={16} />}
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </aside>

        <main className="setup-wizard-main">
          <header>
            <BrandLogo className="setup-wizard-logo" />
            <span className="label-caps">Step {step + 1} / {steps.length}</span>
          </header>

          {step === 0 && (
            <section className="setup-step welcome">
              <h1>Welcome to BickSpec Studio</h1>
              <p>Studio will validate Java, the linked compiler repository, compiler JAR, workspace, interactive mode, generated artifacts, and report readiness before your first real run.</p>
            </section>
          )}

          {step === 1 && <ValidationStep
            title="Java Runtime"
            description="Java 21 is recommended. Studio checks availability, version, and the command it will use."
            value={setupState?.javaPath ?? "java"}
            result={currentCheck}
            actions={[
              { label: "Re-check Java", onClick: () => run(() => backend.validateJava()) },
              { label: "Select Java executable", onClick: () => run(async () => { const selected = await backend.selectJava(); if (selected) await backend.validateJava(selected); }) }
            ]}
          />}

          {step === 2 && (
            <section className="setup-step">
              <h1>Compiler Repository</h1>
              <p>Link the real local bickspec-lang repository root, or clone the official compiler repository from GitHub into a local linked folder. Studio does not copy or duplicate the compiler.</p>
              <div className="setup-path">{setupState?.compilerRepoPath ?? "No repository selected"}</div>
              <p className="setup-helper">Clone the official bickspec-lang compiler repository from GitHub into a local linked folder.</p>
              <p className="setup-helper">Choose a parent folder. Studio will create a bickspec-lang folder inside it.</p>
              <div className="setup-actions">
                <button className="button" onClick={chooseRepo} disabled={busy}>Browse Repository</button>
                <button className="button" onClick={cloneRepo} disabled={busy}>Clone from GitHub</button>
                <button className="button" onClick={() => run(() => backend.validateCompilerRepo())} disabled={busy}>Validate Repository</button>
                <button className="button" onClick={() => run(() => backend.updateCompilerRepo())} disabled={busy || currentCheck?.status !== "success"}>Update Repository</button>
              </div>
              <ResultBanner result={currentCheck} />
            </section>
          )}

          {step === 3 && <ValidationStep
            title="Compiler JAR"
            description="Validate the compiler artifact used by Studio. The expected artifact is usually app/target/bickspec-compiler-1.0.0.jar."
            value={setupState?.compilerJarPath ?? "No JAR selected"}
            result={currentCheck}
            actions={[
              { label: "Browse JAR", onClick: chooseJar },
              { label: "Build from Repository", onClick: () => run(() => backend.buildCompilerFromRepo()) },
              { label: "Validate Compiler", onClick: () => run(() => backend.validateCompilerJar()) }
            ]}
          />}

          {step === 4 && <ValidationStep
            title="Workspace"
            description="Choose the folder Studio will use for projects and setup verification."
            value={setupState?.workspacePath ?? "No workspace selected"}
            result={currentCheck}
            actions={[
              { label: "Use Current Workspace", onClick: useCurrentWorkspace },
              { label: "Browse Workspace", onClick: chooseWorkspace },
              { label: "Validate Workspace", onClick: () => run(() => backend.validateWorkspace()) }
            ]}
          />}

          {step === 5 && (
            <section className="setup-step">
              <h1>Run Test Compilation</h1>
              <p>Studio will compile a real valid BickSpec file and verify the runtime output <code>Resultado:</code> then <code>5.2</code>.</p>
              <div className="setup-actions">
                <button className="button primary" onClick={() => run(async () => setCompilation(await backend.runSetupCompilationTest()))} disabled={busy}><Play size={15} /> Run Test</button>
                <button className="button" onClick={() => run(async () => setCompilation(await backend.runSetupCompilationTest()))} disabled={busy}><RotateCcw size={15} /> Re-run</button>
              </div>
              <ResultBanner result={currentCheck} />
              {compilation && (
                <div className="setup-output-grid">
                  <OutputBlock title="Build Log" text={compilation.buildLog || "No build log."} />
                  <OutputBlock title="Program Output" text={compilation.programOutput || "No program output."} />
                  <OutputBlock title="Diagnostics" text={compilation.diagnostics?.length ? compilation.diagnostics.map((item) => `${item.code} ${item.message}`).join("\n") : "No errors detected."} />
                </div>
              )}
            </section>
          )}

          {step === 6 && (
            <section className="setup-step">
              <h1>Interactive Mode</h1>
              <p>Run a real READ program, send one value, and confirm Studio keeps a live stdin/stdout transcript.</p>
              <div className="setup-actions">
                <button className="button primary" onClick={() => run(() => backend.runSetupInteractiveTest())} disabled={busy}><TerminalSquare size={15} /> Run Interactive Test</button>
                <button className="button" onClick={() => setStep(7)} disabled={busy}>Skip Interactive Test</button>
              </div>
              <ResultBanner result={currentCheck} />
              <div className="setup-transcript">
                {interactiveSession.entries.length ? interactiveSession.entries.map((entry) => (
                  <div className={`setup-transcript-entry ${entry.speaker}`} key={entry.id}>
                    <strong>{entry.speaker === "program" ? "Program" : "You"}</strong>
                    <pre>{entry.text}</pre>
                  </div>
                )) : <span>No interactive transcript yet.</span>}
              </div>
              <div className="setup-inline-input">
                <input value={interactiveInput} onChange={(event) => setInteractiveInput(event.target.value)} placeholder={interactiveSession.active ? "Type input for the running program..." : "No active interactive session"} disabled={!interactiveSession.active} onKeyDown={(event) => { if (event.key === "Enter") void sendWizardInput(); }} />
                <button className="button" onClick={() => void sendWizardInput()} disabled={!interactiveSession.active}>Send</button>
              </div>
            </section>
          )}

          {step === 7 && <ValidationStep
            title="Artifacts & Reports"
            description="Check discovered artifacts plus report/export readiness from the latest real setup run."
            value="Symbols CSV · Parse tree SVG · Generated Java · Class file · Reports"
            result={currentCheck}
            actions={[
              { label: "Validate Artifacts", onClick: () => run(() => backend.validateSetupArtifacts()) },
              { label: "Test Report Export", onClick: () => run(() => backend.testSetupReportExport()) }
            ]}
          />}

          {step === 8 && (
            <section className="setup-step ready">
              <BrandLogo className="setup-wizard-ready-logo" />
              <h1>Studio is ready</h1>
              <SummaryList checks={checks} />
              <div className="setup-actions">
                <button className="button" onClick={() => void openFolderPicker()}><FolderOpen size={15} /> Open Workspace</button>
                <button className="button" onClick={() => void newFile()}>Create New .bks File</button>
              </div>
            </section>
          )}

          {message && <p className="setup-error">{message}</p>}

          <footer>
            {step === 0 ? (
              <>
                <button className="button" onClick={() => void closeSetupAndOpenDocs(() => backend.skipSetup())}>Skip for Now</button>
                <button className="button primary" onClick={() => setStep(1)}>Start Setup</button>
              </>
            ) : (
              <>
                <button className="button" onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</button>
                {step < 8 ? (
                  <button className="button primary" onClick={() => setStep((value) => Math.min(8, value + 1))} disabled={!canContinue()}>Continue</button>
                ) : (
                  <button className="button primary" onClick={() => void closeSetupAndOpenDocs(() => backend.finishSetup())}>Finish</button>
                )}
              </>
            )}
          </footer>
        </main>
      </section>
    </div>
  );
}

function ValidationStep({
  title,
  description,
  value,
  result,
  actions
}: {
  title: string;
  description: string;
  value: string;
  result?: SetupValidationResult;
  actions: Array<{ label: string; onClick(): void }>;
}) {
  return (
    <section className="setup-step">
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="setup-path">{value}</div>
      <div className="setup-actions">
        {actions.map((action) => <button className="button" onClick={action.onClick} key={action.label}>{action.label}</button>)}
      </div>
      <ResultBanner result={result} />
    </section>
  );
}

function ResultBanner({ result }: { result?: SetupValidationResult }) {
  if (!result) return <div className="setup-result idle">Not checked yet.</div>;
  return (
    <div className={`setup-result ${result.status}`}>
      <strong>{result.message}</strong>
      {result.suggestion ? <span>{result.suggestion}</span> : null}
      {result.rawOutput ? <pre>{result.rawOutput}</pre> : null}
    </div>
  );
}

function OutputBlock({ title, text }: { title: string; text: string }) {
  return (
    <article>
      <span className="label-caps">{title}</span>
      <pre>{text}</pre>
    </article>
  );
}

function SummaryList({ checks }: { checks: Record<string, SetupValidationResult | undefined> }) {
  return (
    <ul className="setup-summary">
      {[
        ["Java configured", checks.java],
        ["Compiler repo configured", checks.compilerRepo],
        ["Compiler JAR configured", checks.compilerJar],
        ["Workspace configured", checks.workspace],
        ["Test compilation passed", checks.compilation],
        ["Interactive mode", checks.interactive],
        ["Artifacts", checks.artifacts],
        ["Reports", checks.reports]
      ].map(([label, result]) => (
        <li key={label as string}>
          <span>{label as string}</span>
          <strong className={(result as SetupValidationResult | undefined)?.status ?? "idle"}>{(result as SetupValidationResult | undefined)?.status ?? "idle"}</strong>
        </li>
      ))}
    </ul>
  );
}

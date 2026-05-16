import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  CompilerDiagnostic,
  CompilerSessionResult,
  InteractiveSessionState,
  OpenFileResult,
  GeneratedArtifactMetadata,
  OpenWorkspaceFile,
  RecentWorkspaceEntry,
  SetupState,
  StudioWorkspaceState
} from "@shared/contracts/backend";

interface StudioSessionContextValue {
  workspace: StudioWorkspaceState | null;
  openTabs: OpenWorkspaceFile[];
  activeFile: OpenWorkspaceFile | null;
  recentEntries: RecentWorkspaceEntry[];
  lastSession: CompilerSessionResult | null;
  diagnostics: CompilerDiagnostic[];
  artifacts: GeneratedArtifactMetadata[];
  consoleOutput: string;
  interactiveSession: InteractiveSessionState;
  isRunning: boolean;
  statusMessage: string;
  setupState: SetupState | null;
  setupWizardOpen: boolean;
  setActiveFile(path: string): void;
  newFile(): Promise<void>;
  openFilePicker(): Promise<void>;
  openFolderPicker(): Promise<void>;
  reopenRecent(path: string): Promise<void>;
  openWorkspaceFile(path: string): Promise<void>;
  updateActiveFileContent(content: string): void;
  saveActiveFile(): Promise<void>;
  closeTab(path: string): Promise<void>;
  runActiveFile(): Promise<void>;
  rerunLastTarget(): Promise<void>;
  sendInteractiveInput(input: string): Promise<boolean>;
  openDocumentation(): Promise<void>;
  openOutputFolder(): Promise<void>;
  exportSelectedArtifact(path?: string): Promise<void>;
  openArtifact(path: string): Promise<void>;
  revealArtifact(path: string): Promise<void>;
  readArtifactPreview(path: string): Promise<string>;
  openSetupWizard(): void;
  closeSetupWizard(): void;
  refreshSetupState(): Promise<void>;
}

const StudioSessionContext = createContext<StudioSessionContextValue | undefined>(undefined);

export function StudioSessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<StudioWorkspaceState | null>(null);
  const [openTabs, setOpenTabs] = useState<OpenWorkspaceFile[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [lastSession, setLastSession] = useState<CompilerSessionResult | null>(null);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [interactiveSession, setInteractiveSession] = useState<InteractiveSessionState>({ active: false, transcript: "", entries: [], status: "idle" });
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("BickSpec language server: Ready");
  const [setupState, setSetupState] = useState<SetupState | null>(null);
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);

  const bridge = window.bickspecStudio?.backend;
  const activeFile = openTabs.find((tab) => tab.path === activePath) ?? openTabs[0] ?? null;
  const diagnostics = lastSession?.diagnostics ?? [];
  const artifacts = lastSession?.artifacts.artifacts ?? [];

  useEffect(() => {
    if (!bridge) return;
    void bridge.getStudioWorkspaceState().then(setWorkspace);
    void bridge.getLastCompilerSession().then(setLastSession);
    void bridge.getCompilerConsoleOutput().then(setConsoleOutput);
    void bridge.getInteractiveSessionState().then(setInteractiveSession);
    void bridge.getSetupState().then((state) => {
      setSetupState(state);
      const setupRequired = !state.setupCompleted && !state.setupSkipped;
      setSetupWizardOpen(setupRequired);
      if (!setupRequired && !state.documentationShown) {
        void bridge.saveSetupState({ documentationShown: true }).then(setSetupState);
        void bridge.openDocumentation();
      }
    });
  }, [bridge]);

  useEffect(() => {
    if (!bridge || !interactiveSession.active) return;
    const interval = window.setInterval(() => {
      void bridge.getInteractiveSessionState().then(setInteractiveSession);
    }, 250);
    return () => window.clearInterval(interval);
  }, [bridge, interactiveSession.active]);

  useEffect(() => {
    function handleSaveShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveActiveFile();
      }
    }

    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [activeFile]);

  async function refreshWorkspace(nextWorkspace?: StudioWorkspaceState) {
    if (nextWorkspace) {
      setWorkspace(nextWorkspace);
      return;
    }
    if (bridge) setWorkspace(await bridge.getStudioWorkspaceState());
  }

  function putTab(file: OpenWorkspaceFile) {
    setOpenTabs((tabs) => {
      const existing = tabs.find((tab) => tab.path === file.path);
      if (existing) return tabs.map((tab) => (tab.path === file.path ? file : tab));
      return [...tabs, file];
    });
    setActivePath(file.path);
  }

  async function openResult(result: OpenFileResult | StudioWorkspaceState | null) {
    if (!result) return;
    if ("file" in result) {
      setWorkspace(result.workspace);
      putTab(result.file);
      navigate("/workspace");
    } else {
      setWorkspace(result);
      navigate("/workspace");
    }
  }

  async function newFile() {
    if (!bridge) return;
    await openResult(await bridge.createNewBickSpecFile());
  }

  async function openFilePicker() {
    if (!bridge) return;
    await openResult(await bridge.chooseAndOpenBickSpecFile());
  }

  async function openFolderPicker() {
    if (!bridge) return;
    const nextWorkspace = await bridge.chooseAndOpenWorkspaceFolder();
    if (nextWorkspace) {
      await refreshWorkspace(nextWorkspace);
      navigate("/workspace");
    }
  }

  async function reopenRecent(path: string) {
    if (!bridge) return;
    await openResult(await bridge.reopenRecentEntry(path));
  }

  async function openWorkspaceFile(path: string) {
    if (!bridge) return;
    const result = await bridge.openWorkspaceFile(path);
    setWorkspace(result.workspace);
    putTab(result.file);
    navigate("/workspace");
  }

  function updateActiveFileContent(content: string) {
    if (!activeFile) return;
    setOpenTabs((tabs) =>
      tabs.map((tab) => (tab.path === activeFile.path ? { ...tab, content, dirty: content !== tab.savedContent } : tab))
    );
  }

  async function saveActiveFile() {
    if (!bridge || !activeFile) return;
    const saved = await bridge.saveWorkspaceFile({ filePath: activeFile.path, content: activeFile.content });
    putTab(saved);
    await refreshWorkspace();
    setStatusMessage(`Saved ${saved.name}`);
  }

  async function closeTab(path: string) {
    const tab = openTabs.find((openTab) => openTab.path === path);
    if (!tab) return;

    if (tab.dirty) {
      const shouldClose = window.confirm(`${tab.name} has unsaved changes. Close this tab?`);
      if (!shouldClose) return;
      const shouldSave = window.confirm(`Save changes to ${tab.name} before closing? Select Cancel to discard changes.`);
      if (shouldSave && bridge) {
        const saved = await bridge.saveWorkspaceFile({ filePath: tab.path, content: tab.content });
        await refreshWorkspace();
        setStatusMessage(`Saved ${saved.name}`);
      }
    }

    setOpenTabs((tabs) => {
      const closingIndex = tabs.findIndex((openTab) => openTab.path === path);
      const nextTabs = tabs.filter((openTab) => openTab.path !== path);
      if (activePath === path) {
        const nextActive = nextTabs[Math.max(0, closingIndex - 1)] ?? nextTabs[0] ?? null;
        setActivePath(nextActive?.path ?? null);
      }
      return nextTabs;
    });
  }

  async function runActiveFile() {
    if (!bridge || !activeFile) return;
    if (activeFile.dirty) await saveActiveFile();
    await resetForNewRun();
    setIsRunning(true);
    setStatusMessage(`Running ${activeFile.name}`);
    try {
      await bridge.runBickSpecFile(activeFile.path);
      await refreshLastSession();
    } finally {
      setIsRunning(false);
      setStatusMessage("BickSpec language server: Ready");
    }
  }

  async function rerunLastTarget() {
    if (!bridge) return;
    const targetPath = lastSession?.summary.targetPath ?? activeFile?.path;
    if (!targetPath) return;
    await resetForNewRun();
    setIsRunning(true);
    try {
      await bridge.executeCompilerTarget(targetPath);
      await refreshLastSession();
    } finally {
      setIsRunning(false);
    }
  }

  async function refreshLastSession() {
    if (!bridge) return;
    setLastSession(await bridge.getLastCompilerSession());
    setConsoleOutput(await bridge.getCompilerConsoleOutput());
    setInteractiveSession(await bridge.getInteractiveSessionState());
  }

  async function resetForNewRun() {
    if (!bridge) return;
    setInteractiveSession(await bridge.resetInteractiveSession());
  }

  async function sendInteractiveInput(input: string) {
    if (!bridge) return false;
    const sent = await bridge.sendInteractiveInput(input);
    setInteractiveSession(await bridge.getInteractiveSessionState());
    return sent;
  }

  async function openDocumentation() {
    await bridge?.openDocumentation();
  }

  async function openOutputFolder() {
    const folder = lastSession?.artifacts.rootPath ?? workspace?.workspaceFolderPath;
    if (bridge && folder) await bridge.openOutputFolder(folder);
  }

  async function exportSelectedArtifact(path?: string) {
    const artifactPath = path ?? artifacts[0]?.absolutePath;
    if (bridge && artifactPath) await bridge.exportArtifact(artifactPath);
  }

  async function openArtifact(path: string) {
    await bridge?.openArtifactPath(path);
  }

  async function revealArtifact(path: string) {
    await bridge?.revealArtifactInFolder(path);
  }

  async function readArtifactPreview(path: string) {
    const preview = await bridge?.getArtifactPreviewData(path);
    return preview?.text ?? (preview?.previewKind === "binary" ? "Binary artifact. Use Open or Reveal to inspect it." : "Artifact not found.");
  }

  function openSetupWizard() {
    setSetupWizardOpen(true);
  }

  function closeSetupWizard() {
    setSetupWizardOpen(false);
  }

  async function refreshSetupState() {
    if (!bridge) return;
    const state = await bridge.getSetupState();
    setSetupState(state);
    if (!state.setupCompleted && !state.setupSkipped) setSetupWizardOpen(true);
  }

  const value = useMemo<StudioSessionContextValue>(
    () => ({
      workspace,
      openTabs,
      activeFile,
      recentEntries: workspace?.recentEntries ?? [],
      lastSession,
      diagnostics,
      artifacts,
      consoleOutput,
      interactiveSession,
      isRunning,
      statusMessage,
      setupState,
      setupWizardOpen,
      setActiveFile: setActivePath,
      newFile,
      openFilePicker,
      openFolderPicker,
      reopenRecent,
      openWorkspaceFile,
      updateActiveFileContent,
      saveActiveFile,
      closeTab,
      runActiveFile,
      rerunLastTarget,
      sendInteractiveInput,
      openDocumentation,
      openOutputFolder,
      exportSelectedArtifact,
      openArtifact,
      revealArtifact,
      readArtifactPreview,
      openSetupWizard,
      closeSetupWizard,
      refreshSetupState
    }),
    [activeFile, artifacts, consoleOutput, diagnostics, interactiveSession, isRunning, lastSession, openTabs, setupState, setupWizardOpen, statusMessage, workspace]
  );

  return <StudioSessionContext.Provider value={value}>{children}</StudioSessionContext.Provider>;
}

export function useStudioSession() {
  const context = useContext(StudioSessionContext);
  if (!context) throw new Error("useStudioSession must be used inside StudioSessionProvider");
  return context;
}

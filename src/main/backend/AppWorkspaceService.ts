import { basename, dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { BrowserWindow, dialog, shell, type OpenDialogOptions, type SaveDialogOptions } from "electron";
import type {
  OpenFileResult,
  OpenWorkspaceFile,
  RecentWorkspaceEntry,
  SaveFileRequest,
  StudioWorkspaceState,
  WorkspaceFileNode
} from "@shared/contracts/backend";
import { BackendSettingsService } from "./BackendSettingsService";
import { FileSystemService } from "./FileSystemService";

interface PersistedWorkspaceState {
  workspaceFolderPath?: string;
  recentEntries: RecentWorkspaceEntry[];
}

const allowedExtensions = new Set([".bks", ".java", ".csv", ".json", ".log", ".svg", ".txt", ".md", ".dot", ".class"]);

export class AppWorkspaceService {
  private readonly statePath: string;

  constructor(
    private readonly settingsService: BackendSettingsService,
    private readonly fileSystem: FileSystemService
  ) {
    this.statePath = join(dirname(this.settingsService.settingsPath), "workspace-state.json");
  }

  async getWorkspaceState(): Promise<StudioWorkspaceState> {
    const persisted = await this.readPersistedState();
    const workspaceFolderPath =
      persisted.workspaceFolderPath && (await this.fileSystem.isDirectory(persisted.workspaceFolderPath))
        ? persisted.workspaceFolderPath
        : undefined;
    const recentEntries = await this.getExistingRecentEntries(persisted.recentEntries);
    if (workspaceFolderPath !== persisted.workspaceFolderPath || recentEntries.length !== persisted.recentEntries.length) {
      await this.writePersistedState({ workspaceFolderPath, recentEntries });
    }
    const fileTree = workspaceFolderPath ? await this.listFileNodes(workspaceFolderPath) : [];
    return {
      workspaceFolderPath,
      workspaceName: workspaceFolderPath ? basename(workspaceFolderPath) : undefined,
      fileTree,
      recentEntries
    };
  }

  async createNewBickSpecFile(): Promise<OpenFileResult | null> {
    const persisted = await this.readPersistedState();
    const defaultPath =
      persisted.workspaceFolderPath && (await this.fileSystem.isDirectory(persisted.workspaceFolderPath))
        ? join(persisted.workspaceFolderPath, "untitled.bks")
        : "untitled.bks";
    const result = await this.showSaveDialog({
      title: "New BickSpec File",
      defaultPath,
      filters: [{ name: "BickSpec Files", extensions: ["bks"] }]
    });
    if (result.canceled || !result.filePath) return null;

    const filePath = result.filePath.endsWith(".bks") ? result.filePath : `${result.filePath}.bks`;
    return this.createBickSpecFileAt(filePath);
  }

  async chooseAndOpenBickSpecFile(): Promise<OpenFileResult | null> {
    const result = await this.showOpenDialog({
      title: "Open Studio File",
      properties: ["openFile"],
      filters: [
        { name: "BickSpec Files", extensions: ["bks"] },
        { name: "Readable Studio Files", extensions: ["bks", "java", "csv", "json", "log", "svg", "txt", "md", "dot"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return this.openWorkspaceFile(result.filePaths[0]);
  }

  async chooseAndOpenWorkspaceFolder(): Promise<StudioWorkspaceState | null> {
    const result = await this.showOpenDialog({
      title: "Open Project Folder",
      properties: ["openDirectory"]
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return this.openWorkspaceFolder(result.filePaths[0]);
  }

  async reopenRecentEntry(entryPath: string): Promise<OpenFileResult | StudioWorkspaceState | null> {
    if (await this.fileSystem.isDirectory(entryPath)) return this.openWorkspaceFolder(entryPath);
    if (await this.fileSystem.isFile(entryPath)) return this.openWorkspaceFile(entryPath);
    return null;
  }

  async openWorkspaceFolder(folderPath: string): Promise<StudioWorkspaceState> {
    const persisted = await this.readPersistedState();
    const workspaceFolderPath = resolve(folderPath);
    if (!(await this.fileSystem.isDirectory(workspaceFolderPath))) {
      throw new Error(`Workspace folder does not exist: ${workspaceFolderPath}`);
    }
    const recentEntries = this.addRecent(persisted.recentEntries, {
      kind: "folder",
      path: workspaceFolderPath
    });
    await this.writePersistedState({ workspaceFolderPath, recentEntries });
    return this.getWorkspaceState();
  }

  async openWorkspaceFile(filePath: string): Promise<OpenFileResult> {
    const normalizedPath = resolve(filePath);
    if (!(await this.fileSystem.isFile(normalizedPath))) {
      throw new Error(`File does not exist: ${normalizedPath}`);
    }
    const content = await this.fileSystem.readText(normalizedPath);
    const persisted = await this.readPersistedState();
    const workspaceFolderPath =
      persisted.workspaceFolderPath && this.isPathInside(normalizedPath, persisted.workspaceFolderPath)
        ? persisted.workspaceFolderPath
        : dirname(normalizedPath);
    const recentEntries = this.addRecent(persisted.recentEntries, {
      kind: "file",
      path: normalizedPath
    });
    await this.writePersistedState({ workspaceFolderPath, recentEntries });

    return {
      workspace: await this.getWorkspaceState(),
      file: {
        path: normalizedPath,
        name: basename(normalizedPath),
        content,
        savedContent: content,
        dirty: false
      }
    };
  }

  async saveWorkspaceFile(request: SaveFileRequest): Promise<OpenWorkspaceFile> {
    const normalizedPath = resolve(request.filePath);
    await this.fileSystem.writeText(normalizedPath, request.content);
    const persisted = await this.readPersistedState();
    const workspaceFolderPath =
      persisted.workspaceFolderPath && this.isPathInside(normalizedPath, persisted.workspaceFolderPath)
        ? persisted.workspaceFolderPath
        : dirname(normalizedPath);
    await this.writePersistedState({
      workspaceFolderPath,
      recentEntries: this.addRecent(persisted.recentEntries, {
        kind: "file",
        path: normalizedPath
      })
    });
    return {
      path: normalizedPath,
      name: basename(normalizedPath),
      content: request.content,
      savedContent: request.content,
      dirty: false
    };
  }

  async listWorkspaceFiles(folderPath: string): Promise<StudioWorkspaceState> {
    return this.openWorkspaceFolder(folderPath);
  }

  async getRecentWorkspaceEntries(): Promise<RecentWorkspaceEntry[]> {
    const persisted = await this.readPersistedState();
    const recentEntries = await this.getExistingRecentEntries(persisted.recentEntries);
    if (recentEntries.length !== persisted.recentEntries.length) {
      await this.writePersistedState({ workspaceFolderPath: persisted.workspaceFolderPath, recentEntries });
    }
    return recentEntries;
  }

  async openDocumentation(): Promise<void> {
    const settings = await this.settingsService.getSettings();
    const candidates = [
      join(settings.compiler.repositoryPath, "docs"),
      join(settings.compiler.repositoryPath, "README.md"),
      join(process.cwd(), "README.md")
    ];
    for (const candidate of candidates) {
      if (await this.fileSystem.exists(candidate)) {
        await shell.openPath(candidate);
        return;
      }
    }
  }

  async openOutputFolder(folderPath: string): Promise<void> {
    await shell.openPath(folderPath);
  }

  async exportArtifact(artifactPath: string): Promise<string | null> {
    const result = await this.showSaveDialog({
      title: "Export Artifact",
      defaultPath: basename(artifactPath)
    });
    if (result.canceled || !result.filePath) return null;
    await this.fileSystem.copyFile(artifactPath, result.filePath);
    return result.filePath;
  }

  private async readPersistedState(): Promise<PersistedWorkspaceState> {
    const state = await this.fileSystem.readJson<Partial<PersistedWorkspaceState>>(this.statePath);
    return {
      workspaceFolderPath: state?.workspaceFolderPath,
      recentEntries: Array.isArray(state?.recentEntries) ? state.recentEntries : []
    };
  }

  private async writePersistedState(state: PersistedWorkspaceState): Promise<void> {
    await this.fileSystem.writeJson(this.statePath, state);
  }

  private addRecent(entries: RecentWorkspaceEntry[], next: { kind: "file" | "folder"; path: string }): RecentWorkspaceEntry[] {
    const normalizedPath = resolve(next.path);
    return [
      {
        id: normalizedPath,
        kind: next.kind,
        name: basename(normalizedPath),
        path: normalizedPath,
        openedAt: new Date().toISOString()
      },
      ...entries.filter((entry) => entry.path !== normalizedPath)
    ].slice(0, 12);
  }

  private async listFileNodes(folderPath: string): Promise<WorkspaceFileNode[]> {
    const nodes: WorkspaceFileNode[] = [];
    await this.walk(folderPath, 0, nodes);
    return nodes;
  }

  private async walk(folderPath: string, depth: number, nodes: WorkspaceFileNode[]): Promise<void> {
    if (depth > 8) return;
    const entries = (await this.fileSystem.listDirectory(folderPath)).sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const extension = extname(entry.name).toLowerCase();
      if (entry.isFile && !allowedExtensions.has(extension)) continue;
      nodes.push({
        id: entry.path,
        name: entry.name,
        path: entry.path,
        kind: entry.isDirectory ? "folder" : this.kindFromExtension(extension),
        depth
      });
      if (entry.isDirectory) await this.walk(entry.path, depth + 1, nodes);
    }
  }

  private kindFromExtension(extension: string): WorkspaceFileNode["kind"] {
    if (extension === ".bks") return "bks";
    if (extension === ".java") return "java";
    if (extension === ".csv") return "csv";
    if (extension === ".json") return "json";
    if (extension === ".md") return "markdown";
    if (extension === ".log") return "log";
    if (extension === ".svg") return "svg";
    if (extension === ".dot") return "dot";
    if (extension === ".class") return "class";
    if (extension === ".txt") return "text";
    return "other";
  }

  private isPathInside(filePath: string, folderPath: string): boolean {
    const relativePath = relative(resolve(folderPath), resolve(filePath));
    return relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath));
  }

  async createBickSpecFileAt(filePath: string): Promise<OpenFileResult> {
    const template = "spec NewSpecification {\n  input assets: Array<Asset>;\n\n  report Summary {\n    export pdf, csv, excel;\n  }\n}\n";
    await this.fileSystem.writeText(filePath, template);
    return this.openWorkspaceFile(filePath);
  }

  private async getExistingRecentEntries(entries: RecentWorkspaceEntry[]): Promise<RecentWorkspaceEntry[]> {
    const existingEntries: RecentWorkspaceEntry[] = [];
    for (const entry of entries) {
      const exists = entry.kind === "folder" ? await this.fileSystem.isDirectory(entry.path) : await this.fileSystem.isFile(entry.path);
      if (exists) existingEntries.push(entry);
    }
    return existingEntries;
  }

  private showOpenDialog(options: OpenDialogOptions) {
    const window = this.getDialogParentWindow();
    return window ? dialog.showOpenDialog(window, options) : dialog.showOpenDialog(options);
  }

  private showSaveDialog(options: SaveDialogOptions) {
    const window = this.getDialogParentWindow();
    return window ? dialog.showSaveDialog(window, options) : dialog.showSaveDialog(options);
  }

  private getDialogParentWindow(): BrowserWindow | undefined {
    return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  }
}

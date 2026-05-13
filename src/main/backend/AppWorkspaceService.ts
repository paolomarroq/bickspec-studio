import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { dialog, shell } from "electron";
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
    const fileTree = persisted.workspaceFolderPath ? await this.listFileNodes(persisted.workspaceFolderPath) : [];
    return {
      workspaceFolderPath: persisted.workspaceFolderPath,
      workspaceName: persisted.workspaceFolderPath ? basename(persisted.workspaceFolderPath) : undefined,
      fileTree,
      recentEntries: persisted.recentEntries
    };
  }

  async createNewBickSpecFile(): Promise<OpenFileResult | null> {
    const result = await dialog.showSaveDialog({
      title: "New BickSpec File",
      defaultPath: "untitled.bks",
      filters: [{ name: "BickSpec Files", extensions: ["bks"] }]
    });
    if (result.canceled || !result.filePath) return null;

    const filePath = result.filePath.endsWith(".bks") ? result.filePath : `${result.filePath}.bks`;
    const template = "spec NewSpecification {\n  input assets: Array<Asset>;\n\n  report Summary {\n    export pdf, csv, excel;\n  }\n}\n";
    await this.fileSystem.writeText(filePath, template);
    return this.openWorkspaceFile(filePath);
  }

  async chooseAndOpenBickSpecFile(): Promise<OpenFileResult | null> {
    const result = await dialog.showOpenDialog({
      title: "Open BickSpec File",
      properties: ["openFile"],
      filters: [{ name: "BickSpec Files", extensions: ["bks"] }]
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return this.openWorkspaceFile(result.filePaths[0]);
  }

  async chooseAndOpenWorkspaceFolder(): Promise<StudioWorkspaceState | null> {
    const result = await dialog.showOpenDialog({
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
    const recentEntries = this.addRecent(persisted.recentEntries, {
      kind: "folder",
      path: workspaceFolderPath
    });
    await this.writePersistedState({ workspaceFolderPath, recentEntries });
    return this.getWorkspaceState();
  }

  async openWorkspaceFile(filePath: string): Promise<OpenFileResult> {
    const normalizedPath = resolve(filePath);
    const content = await this.fileSystem.readText(normalizedPath);
    const persisted = await this.readPersistedState();
    const workspaceFolderPath = persisted.workspaceFolderPath ?? dirname(normalizedPath);
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
    await this.fileSystem.writeText(request.filePath, request.content);
    return {
      path: request.filePath,
      name: basename(request.filePath),
      content: request.content,
      savedContent: request.content,
      dirty: false
    };
  }

  async listWorkspaceFiles(folderPath: string): Promise<StudioWorkspaceState> {
    return this.openWorkspaceFolder(folderPath);
  }

  async getRecentWorkspaceEntries(): Promise<RecentWorkspaceEntry[]> {
    return (await this.readPersistedState()).recentEntries;
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
    const result = await dialog.showSaveDialog({
      title: "Export Artifact",
      defaultPath: basename(artifactPath)
    });
    if (result.canceled || !result.filePath) return null;
    await this.fileSystem.copyFile(artifactPath, result.filePath);
    return result.filePath;
  }

  private async readPersistedState(): Promise<PersistedWorkspaceState> {
    return (await this.fileSystem.readJson<PersistedWorkspaceState>(this.statePath)) ?? { recentEntries: [] };
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
    await this.walk(folderPath, 0, nodes, folderPath);
    return nodes;
  }

  private async walk(folderPath: string, depth: number, nodes: WorkspaceFileNode[], rootPath: string): Promise<void> {
    if (depth > 4) return;
    const entries = (await this.fileSystem.listDirectory(folderPath)).sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "target") continue;
      const extension = extname(entry.name).toLowerCase();
      if (entry.isFile && !allowedExtensions.has(extension)) continue;
      nodes.push({
        id: entry.path,
        name: entry.name,
        path: entry.path,
        kind: entry.isDirectory ? "folder" : this.kindFromExtension(extension),
        depth
      });
      if (entry.isDirectory) await this.walk(entry.path, depth + 1, nodes, rootPath);
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
}


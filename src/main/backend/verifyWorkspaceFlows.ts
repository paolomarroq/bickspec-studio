import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { BackendServices } from "./createBackendServices";
import type { OpenFileResult } from "@shared/contracts/backend";

interface VerifiableWorkspaceService {
  createBickSpecFileAt(filePath: string): Promise<OpenFileResult>;
}

export async function verifyWorkspaceFlows(backend: BackendServices): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "bickspec-studio-workspace-"));
  const workspacePath = join(root, "workspace");
  const nestedPath = join(workspacePath, "nested");
  const bickspecPath = join(workspacePath, "portfolio-analysis.bks");
  const openedPath = join(nestedPath, "opened.bks");
  const notesPath = join(nestedPath, "notes.md");

  try {
    const workspaceService = backend.appWorkspace as BackendServices["appWorkspace"] & VerifiableWorkspaceService;

    const created = await workspaceService.createBickSpecFileAt(bickspecPath);
    assertEqual(created.file.path, bickspecPath, "created file path");
    assertIncludes(await readFile(bickspecPath, "utf8"), 'PROJECT "New Specification"', "new file starter content");

    const saved = await backend.appWorkspace.saveWorkspaceFile({
      filePath: bickspecPath,
      content: `${created.file.content}\n// verified save\n`
    });
    assertEqual(saved.dirty, false, "saved file dirty state");
    assertIncludes(await readFile(bickspecPath, "utf8"), "verified save", "saved file content");

    await mkdir(nestedPath, { recursive: true });
    await writeFile(openedPath, 'PROJECT "OpenedFromDisk" {}\n', "utf8");
    await writeFile(notesPath, "# Workspace note\n", "utf8");

    const workspace = await backend.appWorkspace.openWorkspaceFolder(workspacePath);
    assertEqual(workspace.workspaceFolderPath, workspacePath, "workspace path");
    assert(workspace.fileTree.some((node) => node.path === openedPath), "workspace tree includes nested .bks file");
    assert(workspace.fileTree.some((node) => node.path === notesPath), "workspace tree includes markdown file");

    const opened = await backend.appWorkspace.openWorkspaceFile(openedPath);
    assertIncludes(opened.file.content, "OpenedFromDisk", "opened file content");

    const recentEntries = await backend.appWorkspace.getRecentWorkspaceEntries();
    assert(recentEntries.some((entry) => entry.kind === "file" && entry.path === openedPath), "recent file stored");
    assert(recentEntries.some((entry) => entry.kind === "folder" && entry.path === workspacePath), "recent folder stored");

    const reopenedFile = await backend.appWorkspace.reopenRecentEntry(openedPath);
    assert(reopenedFile !== null && "file" in reopenedFile && reopenedFile.file.path === openedPath, "recent file reopens");

    const reopenedFolder = await backend.appWorkspace.reopenRecentEntry(workspacePath);
    assert(reopenedFolder !== null && !("file" in reopenedFolder) && reopenedFolder.workspaceFolderPath === workspacePath, "recent folder reopens");

    console.log("BickSpec Studio workspace flow verification passed.");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function assert(condition: boolean, label: string): asserts condition {
  if (!condition) throw new Error(`Workspace flow verification failed: ${label}`);
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  assert(Object.is(actual, expected), `${label}. Expected ${String(expected)}, received ${String(actual)}`);
}

function assertIncludes(value: string, expected: string, label: string): void {
  assert(value.includes(expected), `${label}. Expected content to include ${expected}`);
}

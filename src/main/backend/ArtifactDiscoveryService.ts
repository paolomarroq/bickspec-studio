import { basename, extname, isAbsolute, join, relative, resolve } from "node:path";
import type {
  ArtifactCollection,
  CompilerExecutionResult,
  CompilerOutputTag,
  GeneratedArtifactMetadata,
  GeneratedArtifactType
} from "@shared/contracts/backend";
import { FileSystemService } from "./FileSystemService";

export class ArtifactDiscoveryService {
  constructor(private readonly fileSystem: FileSystemService) {}

  async discover(result: CompilerExecutionResult): Promise<ArtifactCollection> {
    const rootPath = result.targetKind === "directory" ? result.targetPath : result.workingDirectory;
    const paths = this.candidatePathsFromOutput(result);
    const artifacts: GeneratedArtifactMetadata[] = [];

    for (const candidate of paths) {
      const artifact = await this.toArtifact(candidate.path, rootPath, candidate.tag);
      if (artifact && !artifacts.some((existing) => existing.absolutePath === artifact.absolutePath)) {
        artifacts.push(artifact);
      }
    }

    return {
      rootPath,
      artifacts,
      groups: this.groupArtifacts(artifacts)
    };
  }

  private candidatePathsFromOutput(result: CompilerExecutionResult): Array<{ path: string; tag?: CompilerOutputTag }> {
    return result.parsedOutput.artifacts
      .filter((line) => line.path)
      .map((line) => ({
        path: this.resolveOutputPath(line.path as string, result.workingDirectory),
        tag: line.tag
      }));
  }

  private resolveOutputPath(path: string, workingDirectory: string): string {
    return isAbsolute(path) ? path : resolve(workingDirectory, path);
  }

  private async toArtifact(path: string, rootPath: string, sourceTag?: CompilerOutputTag): Promise<GeneratedArtifactMetadata | null> {
    const exists = await this.fileSystem.exists(path);
    const metadata = exists ? await this.fileSystem.getFileMetadata(path) : null;

    return {
      id: path,
      type: this.getType(path, sourceTag),
      absolutePath: path,
      projectRelativePath: relative(rootPath, path) || basename(path),
      displayName: basename(path),
      exists,
      lastModifiedAt: metadata?.lastModifiedAt,
      sizeBytes: metadata?.sizeBytes,
      sourceTag
    };
  }

  private getType(path: string, sourceTag?: CompilerOutputTag): GeneratedArtifactType {
    const extension = extname(path).toLowerCase();
    if (sourceTag === "SYMBOLS" || extension === ".csv") return "symbols";
    if (sourceTag === "TREE" && extension === ".svg") return "tree-svg";
    if (sourceTag === "TREE" && extension === ".dot") return "tree-dot";
    if (sourceTag === "JAVA" || extension === ".java") return "java";
    if (sourceTag === "BUILD" || extension === ".class") return "class";
    if (sourceTag === "SUMMARY") return "summary";
    if (extension === ".log") return "log";
    if ([".pdf", ".xlsx", ".html"].includes(extension)) return "report";
    return "other";
  }

  private groupArtifacts(artifacts: GeneratedArtifactMetadata[]): ArtifactCollection["groups"] {
    const counts = new Map<GeneratedArtifactType, number>();
    for (const artifact of artifacts) {
      counts.set(artifact.type, (counts.get(artifact.type) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
  }
}


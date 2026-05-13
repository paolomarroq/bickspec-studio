import { shell } from "electron";
import type { ArtifactPreviewData } from "@shared/contracts/backend";
import { FileSystemService } from "./FileSystemService";

const textExtensions = new Set([".bks", ".txt", ".log", ".csv", ".json", ".xml", ".html", ".java", ".dot", ".md"]);

export class ArtifactAccessService {
  constructor(private readonly fileSystem: FileSystemService) {}

  async openArtifactPath(artifactPath: string): Promise<void> {
    await shell.openPath(artifactPath);
  }

  async revealArtifactInFolder(artifactPath: string): Promise<void> {
    shell.showItemInFolder(artifactPath);
  }

  async readArtifactText(artifactPath: string): Promise<string> {
    return this.fileSystem.readText(artifactPath);
  }

  async getArtifactPreviewData(artifactPath: string): Promise<ArtifactPreviewData> {
    const exists = await this.fileSystem.isFile(artifactPath);
    if (!exists) {
      return { artifactPath, exists: false, previewKind: "missing" };
    }

    const metadata = await this.fileSystem.getFileMetadata(artifactPath);
    const isText = textExtensions.has(artifactPath.slice(artifactPath.lastIndexOf(".")).toLowerCase());
    if (!isText) {
      return { artifactPath, exists: true, previewKind: "binary", sizeBytes: metadata?.sizeBytes };
    }

    const text = await this.fileSystem.readText(artifactPath);
    const maxLength = 64_000;
    return {
      artifactPath,
      exists: true,
      previewKind: "text",
      text: text.length > maxLength ? text.slice(0, maxLength) : text,
      sizeBytes: metadata?.sizeBytes,
      truncated: text.length > maxLength
    };
  }
}


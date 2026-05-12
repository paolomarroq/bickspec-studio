import { join, resolve } from "node:path";
import type { CompilerRepositoryValidation, RepositorySignalStatus } from "@shared/contracts/backend";
import { FileSystemService } from "./FileSystemService";

const artifactNames = [
  "bickspec-app.jar",
  "bickspec-lang.jar",
  "bickspec-compiler.jar",
  "app.jar"
];

export class CompilerRepositoryResolver {
  constructor(private readonly fileSystem: FileSystemService) {}

  async validate(repositoryPath: string, preferredArtifactPath?: string): Promise<CompilerRepositoryValidation> {
    const normalizedPath = resolve(repositoryPath);
    const exists = await this.fileSystem.isDirectory(normalizedPath);
    const artifactCandidates = await this.getArtifactCandidates(normalizedPath, preferredArtifactPath);
    const signals: RepositorySignalStatus[] = [
      await this.signal("app/pom.xml", join(normalizedPath, "app", "pom.xml")),
      await this.signal("app/target", join(normalizedPath, "app", "target")),
      await this.signal("docs/BickSpec.g4", join(normalizedPath, "docs", "BickSpec.g4")),
      {
        name: "compiler-artifact",
        path: artifactCandidates[0] ?? join(normalizedPath, "app", "target"),
        found: artifactCandidates.length > 0
      }
    ];
    const foundSignals = signals.filter((signal) => signal.found).length;
    const isValid = exists && foundSignals >= 2 && signals.some((signal) => signal.name === "app/pom.xml" && signal.found);

    return {
      repositoryPath: normalizedPath,
      exists,
      isValid,
      signals,
      artifactCandidates,
      message: isValid
        ? "Linked BickSpec language repository detected."
        : "BickSpec language repository not found or missing expected app/pom.xml and grammar/build signals."
    };
  }

  private async signal(name: RepositorySignalStatus["name"], path: string): Promise<RepositorySignalStatus> {
    return {
      name,
      path,
      found: await this.fileSystem.exists(path)
    };
  }

  private async getArtifactCandidates(repositoryPath: string, preferredArtifactPath?: string): Promise<string[]> {
    const candidates = [
      ...(preferredArtifactPath ? [resolve(preferredArtifactPath)] : []),
      ...artifactNames.map((artifactName) => join(repositoryPath, "app", "target", artifactName))
    ];
    const existingCandidates: string[] = [];

    for (const candidate of candidates) {
      if (await this.fileSystem.exists(candidate)) existingCandidates.push(candidate);
    }

    return existingCandidates;
  }
}


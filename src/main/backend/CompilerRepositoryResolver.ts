import { join, resolve } from "node:path";
import type { CompilerArtifactResolution, CompilerRepositoryValidation, RepositorySignalStatus } from "@shared/contracts/backend";
import { FileSystemService } from "./FileSystemService";

const artifactNames = [
  "bickspec-compiler-1.0.0.jar",
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
    const artifactResolution = await this.resolveArtifact(normalizedPath, preferredArtifactPath);
    const artifactCandidates = artifactResolution.artifactPath ? [artifactResolution.artifactPath] : [];
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

  async resolveArtifact(repositoryPath: string, preferredArtifactPath?: string): Promise<CompilerArtifactResolution> {
    const normalizedPath = resolve(repositoryPath);
    const targetDirectory = join(normalizedPath, "app", "target");
    const checkedPaths = [
      ...(preferredArtifactPath ? [resolve(preferredArtifactPath)] : []),
      ...artifactNames.map((artifactName) => join(targetDirectory, artifactName))
    ];
    const targetFiles = await this.fileSystem.listFiles(targetDirectory);
    const discoveredArtifacts = targetFiles
      .filter((file) => /^bickspec-.*\.jar$/i.test(file) && !file.startsWith("original-"))
      .map((file) => join(targetDirectory, file));
    const candidates = [...checkedPaths, ...discoveredArtifacts];
    const artifactPath = await this.firstExistingFile(candidates);
    const buildable = await this.fileSystem.exists(join(normalizedPath, "app", "pom.xml"));

    return {
      repositoryPath: normalizedPath,
      artifactPath,
      found: Boolean(artifactPath),
      buildable,
      checkedPaths: Array.from(new Set(candidates)),
      message: artifactPath
        ? "Compiler artifact resolved from linked BickSpec language repository."
        : buildable
          ? "Compiler artifact is missing, but app/pom.xml is present so the linked repository is buildable."
          : "Compiler artifact is missing and the linked repository does not appear buildable."
    };
  }

  private async signal(name: RepositorySignalStatus["name"], path: string): Promise<RepositorySignalStatus> {
    return {
      name,
      path,
      found: await this.fileSystem.exists(path)
    };
  }

  private async firstExistingFile(candidates: string[]): Promise<string | undefined> {
    for (const candidate of candidates) {
      if (await this.fileSystem.isFile(candidate)) return candidate;
    }
    return undefined;
  }
}

import { join, resolve } from "node:path";
import type { CompilerArtifactResolution, CompilerRepositoryValidation, RepositorySignalStatus } from "@shared/contracts/backend";
import { FileSystemService } from "./FileSystemService";

const bundledCompilerJarName = "bickspec-compiler-1.0.0.jar";

const artifactNames = [
  bundledCompilerJarName,
  "bickspec-app.jar",
  "bickspec-lang.jar",
  "bickspec-compiler.jar",
  "app.jar"
];

export class CompilerRepositoryResolver {
  constructor(
    private readonly fileSystem: FileSystemService,
    private readonly appRootPath: string
  ) {}

  async validate(repositoryPath: string, preferredArtifactPath?: string): Promise<CompilerRepositoryValidation> {
    const normalizedPath = resolve(repositoryPath);
    const exists = await this.fileSystem.isDirectory(normalizedPath);
    const artifactResolution = await this.resolveLinkedArtifact(normalizedPath, preferredArtifactPath);
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
    const bundledCandidates = this.getBundledCompilerCandidates();
    const checkedPaths = [
      ...(preferredArtifactPath ? [resolve(preferredArtifactPath)] : []),
      ...bundledCandidates,
      ...artifactNames.map((artifactName) => join(targetDirectory, artifactName))
    ];
    const targetFiles = await this.fileSystem.listFiles(targetDirectory);
    const discoveredArtifacts = targetFiles
      .filter((file) => /^bickspec-.*\.jar$/i.test(file) && !file.startsWith("original-"))
      .map((file) => join(targetDirectory, file));
    const candidates = [...checkedPaths, ...discoveredArtifacts];
    const preferredPath = preferredArtifactPath ? await this.firstExistingFile([resolve(preferredArtifactPath)]) : undefined;
    const bundledPath = await this.firstExistingFile(bundledCandidates);
    const linkedPath = await this.firstExistingFile([...artifactNames.map((artifactName) => join(targetDirectory, artifactName)), ...discoveredArtifacts]);
    const artifactPath = preferredPath ?? bundledPath ?? linkedPath;
    const source = preferredPath
      ? "custom"
      : bundledPath
        ? "bundled"
        : linkedPath
          ? "linked-repository"
          : "missing";
    const buildable = await this.fileSystem.exists(join(normalizedPath, "app", "pom.xml"));

    return {
      repositoryPath: normalizedPath,
      artifactPath,
      found: Boolean(artifactPath),
      buildable,
      checkedPaths: Array.from(new Set(candidates)),
      source,
      message: artifactPath
        ? source === "bundled"
          ? "Bundled BickSpec compiler JAR resolved from Studio resources."
          : source === "custom"
            ? "Custom BickSpec compiler JAR resolved from user configuration."
            : "Compiler artifact resolved from linked BickSpec language repository."
        : buildable
          ? "Compiler artifact is missing, but app/pom.xml is present so the linked repository is buildable."
          : "Compiler artifact is missing. Studio expected a bundled compiler JAR in resources/compiler or app resources."
    };
  }

  async resolveLinkedArtifact(repositoryPath: string, preferredArtifactPath?: string): Promise<CompilerArtifactResolution> {
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
      source: artifactPath ? "linked-repository" : "missing",
      message: artifactPath
        ? "Compiler artifact resolved from linked BickSpec language repository."
        : buildable
          ? "Compiler artifact is missing, but app/pom.xml is present so the linked repository is buildable."
          : "Compiler artifact is missing and the linked repository does not appear buildable."
    };
  }

  getBundledCompilerCandidates(): string[] {
    const electronProcess = process as NodeJS.Process & { resourcesPath?: string };
    const candidates = [
      electronProcess.resourcesPath ? join(electronProcess.resourcesPath, "compiler", bundledCompilerJarName) : undefined,
      join(this.appRootPath, "resources", "compiler", bundledCompilerJarName),
      join(resolve(this.appRootPath, "..", ".."), "resources", "compiler", bundledCompilerJarName)
    ].filter(Boolean) as string[];
    return Array.from(new Set(candidates.map((candidate) => resolve(candidate))));
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

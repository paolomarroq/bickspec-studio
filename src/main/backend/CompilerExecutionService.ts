import { dirname, resolve } from "node:path";
import type {
  ArtifactPreviewData,
  CompilerDiagnostic,
  CompilerArtifactResolution,
  CompilerExecutionRequest,
  CompilerExecutionResult,
  CompilerExecutionStatus,
  CompilerExecutionTargetKind,
  CompilerSessionResult,
  GeneratedArtifactMetadata,
  ParsedCompilerOutput
} from "@shared/contracts/backend";
import { ArtifactAccessService } from "./ArtifactAccessService";
import { ArtifactDiscoveryService } from "./ArtifactDiscoveryService";
import { BackendSettingsService } from "./BackendSettingsService";
import { CompilerDiagnosticsParser } from "./CompilerDiagnosticsParser";
import { CompilerOutputParser } from "./CompilerOutputParser";
import { CompilerRepositoryResolver } from "./CompilerRepositoryResolver";
import { CompilerSessionMapper } from "./CompilerSessionMapper";
import { FileSystemService } from "./FileSystemService";
import { ProcessExecutionService } from "./ProcessExecutionService";

export class CompilerExecutionService {
  private status: CompilerExecutionStatus = { state: "idle" };
  private lastResult: CompilerExecutionResult | null = null;
  private lastSession: CompilerSessionResult | null = null;

  constructor(
    private readonly settingsService: BackendSettingsService,
    private readonly repositoryResolver: CompilerRepositoryResolver,
    private readonly processExecution: ProcessExecutionService,
    private readonly fileSystem: FileSystemService,
    private readonly outputParser: CompilerOutputParser,
    private readonly diagnosticsParser: CompilerDiagnosticsParser,
    private readonly artifactDiscovery: ArtifactDiscoveryService,
    private readonly artifactAccess: ArtifactAccessService,
    private readonly sessionMapper: CompilerSessionMapper
  ) {}

  getStatus(): CompilerExecutionStatus {
    return this.status;
  }

  getLastResult(): CompilerExecutionResult | null {
    return this.lastResult;
  }

  getLastSession(): CompilerSessionResult | null {
    return this.lastSession;
  }

  getLastDiagnostics(): CompilerDiagnostic[] {
    return this.lastSession?.diagnostics ?? [];
  }

  getLastArtifacts(): GeneratedArtifactMetadata[] {
    return this.lastSession?.artifacts.artifacts ?? [];
  }

  getCompilerConsoleOutput(): string {
    if (!this.lastResult) return "";
    return `${this.lastResult.stdout}\n${this.lastResult.stderr}`.trim();
  }

  clearLastSession(): void {
    this.lastResult = null;
    this.lastSession = null;
    this.status = { state: "idle" };
  }

  openArtifactPath(artifactPath: string): Promise<void> {
    return this.artifactAccess.openArtifactPath(artifactPath);
  }

  revealArtifactInFolder(artifactPath: string): Promise<void> {
    return this.artifactAccess.revealArtifactInFolder(artifactPath);
  }

  readArtifactText(artifactPath: string): Promise<string> {
    return this.artifactAccess.readArtifactText(artifactPath);
  }

  getArtifactPreviewData(artifactPath: string): Promise<ArtifactPreviewData> {
    return this.artifactAccess.getArtifactPreviewData(artifactPath);
  }

  parseCompilerOutput(rawOutput: string): ParsedCompilerOutput {
    return this.outputParser.parse(rawOutput);
  }

  async getResolvedCompilerArtifact(): Promise<CompilerArtifactResolution> {
    const settings = await this.settingsService.getSettings();
    return this.repositoryResolver.resolveArtifact(settings.compiler.repositoryPath, settings.compiler.preferredArtifactPath);
  }

  compileCurrentFile(filePath: string): Promise<CompilerExecutionResult> {
    return this.executeCompilerTarget({ targetPath: filePath, targetKind: "file" });
  }

  runCurrentFile(filePath: string): Promise<CompilerExecutionResult> {
    return this.executeCompilerTarget({ targetPath: filePath, targetKind: "file" });
  }

  compileDirectory(directoryPath: string): Promise<CompilerExecutionResult> {
    return this.executeCompilerTarget({ targetPath: directoryPath, targetKind: "directory" });
  }

  async executeCompilerTarget(request: CompilerExecutionRequest): Promise<CompilerExecutionResult> {
    const settings = await this.settingsService.getSettings();
    const targetPath = resolve(request.targetPath);
    const repositoryValidation = await this.repositoryResolver.validate(
      settings.compiler.repositoryPath,
      settings.compiler.preferredArtifactPath
    );
    const artifact = await this.repositoryResolver.resolveArtifact(
      settings.compiler.repositoryPath,
      settings.compiler.preferredArtifactPath
    );
    const targetExists = request.targetKind === "directory"
      ? await this.fileSystem.isDirectory(targetPath)
      : await this.fileSystem.exists(targetPath);
    const startedAt = new Date().toISOString();

    this.status = {
      state: "running",
      startedAt,
      lastTargetPath: targetPath
    };

    if (!repositoryValidation.isValid || !artifact.found || !artifact.artifactPath || !targetExists) {
      const parsedOutput = this.outputParser.parse("");
      const result: CompilerExecutionResult = {
        success: false,
        command: settings.execution.javaCommand,
        args: artifact.artifactPath ? ["-jar", artifact.artifactPath, targetPath] : [],
        workingDirectory: artifact.artifactPath ? dirname(artifact.artifactPath) : repositoryValidation.repositoryPath,
        stdout: "",
        stderr: this.buildPreflightError(repositoryValidation.isValid, artifact, targetExists),
        exitCode: null,
        durationMs: 0,
        repositoryPath: repositoryValidation.repositoryPath,
        compilerArtifactPath: artifact.artifactPath,
        interactive: false,
        targetPath,
        targetKind: request.targetKind,
        parsedOutput,
        error: this.buildPreflightError(repositoryValidation.isValid, artifact, targetExists)
      };
      this.lastResult = result;
      this.status = {
        state: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        lastTargetPath: targetPath,
        lastExitCode: null
      };
      await this.storeSession(result);
      return result;
    }

    const args = ["-jar", artifact.artifactPath, targetPath];
    const workingDirectory = dirname(artifact.artifactPath);

    const result = await this.processExecution.run(settings.execution.javaCommand, args, {
      cwd: workingDirectory,
      timeoutMs: 120_000,
      toResult: ({ stdout, stderr, exitCode, durationMs, interactive, error }) => {
        const parsedOutput = this.outputParser.parse(`${stdout}\n${stderr}`);
        return {
          success: exitCode === 0 && !error,
          command: settings.execution.javaCommand,
          args,
          workingDirectory,
          stdout,
          stderr,
          exitCode,
          durationMs,
          repositoryPath: repositoryValidation.repositoryPath,
          compilerArtifactPath: artifact.artifactPath,
          interactive,
          targetPath,
          targetKind: request.targetKind,
          parsedOutput,
          error
        };
      }
    });

    this.lastResult = result;
    this.status = {
      state: result.success ? "completed" : "failed",
      startedAt,
      completedAt: new Date().toISOString(),
      lastTargetPath: targetPath,
      lastExitCode: result.exitCode
    };
    await this.storeSession(result);

    return result;
  }

  private async storeSession(result: CompilerExecutionResult): Promise<void> {
    const diagnostics = this.diagnosticsParser.parse(result.parsedOutput, result.stderr || result.error || "");
    const artifacts = await this.artifactDiscovery.discover(result);
    this.lastSession = this.sessionMapper.toSession(result, diagnostics, artifacts, {
      startedAt: this.status.startedAt,
      completedAt: this.status.completedAt
    });
  }

  private buildPreflightError(repositoryValid: boolean, artifact: CompilerArtifactResolution, targetExists: boolean): string {
    const errors: string[] = [];
    if (!repositoryValid) errors.push("Linked BickSpec language repository is not valid.");
    if (!artifact.found) errors.push(artifact.message);
    if (!targetExists) errors.push("Compiler target path does not exist.");
    return errors.join(" ");
  }
}

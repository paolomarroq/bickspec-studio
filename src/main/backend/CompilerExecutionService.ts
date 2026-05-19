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
  ParsedCompilerOutput,
  InteractiveSessionState
} from "@shared/contracts/backend";
import { ArtifactAccessService } from "./ArtifactAccessService";
import { ArtifactDiscoveryService } from "./ArtifactDiscoveryService";
import { BackendSettingsService } from "./BackendSettingsService";
import { CompilerDiagnosticsParser } from "./CompilerDiagnosticsParser";
import { CompilerOutputParser } from "./CompilerOutputParser";
import { CompilerRepositoryResolver } from "./CompilerRepositoryResolver";
import { CompilerResultNormalizer } from "./CompilerResultNormalizer";
import { CompilerSessionMapper } from "./CompilerSessionMapper";
import { FileSystemService } from "./FileSystemService";
import { InteractiveSessionManager } from "./InteractiveSessionManager";
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
    private readonly sessionMapper: CompilerSessionMapper,
    private readonly resultNormalizer: CompilerResultNormalizer,
    private readonly interactiveSessions: InteractiveSessionManager
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

  getInteractiveSessionState(): InteractiveSessionState {
    return this.interactiveSessions.getState();
  }

  sendInteractiveInput(input: string): boolean {
    return this.interactiveSessions.sendInput(input);
  }

  clearLastSession(): void {
    this.lastResult = null;
    this.lastSession = null;
    this.status = { state: "idle" };
  }

  resetInteractiveSession(): InteractiveSessionState {
    this.interactiveSessions.reset();
    return this.interactiveSessions.getState();
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
    this.interactiveSessions.reset();
    const settings = await this.settingsService.getSettings();
    const targetPath = resolve(request.targetPath);
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

    if (!artifact.found || !artifact.artifactPath || !targetExists) {
      const parsedOutput = this.outputParser.parse("");
      const result: CompilerExecutionResult = {
        success: false,
        command: settings.execution.javaCommand,
        args: artifact.artifactPath ? ["-jar", artifact.artifactPath, targetPath] : [],
        workingDirectory: artifact.artifactPath ? dirname(artifact.artifactPath) : artifact.repositoryPath,
        stdout: "",
        stderr: this.buildPreflightError(artifact, targetExists),
        exitCode: null,
        durationMs: 0,
        repositoryPath: artifact.repositoryPath,
        compilerArtifactPath: artifact.artifactPath,
        interactive: false,
        targetPath,
        targetKind: request.targetKind,
        parsedOutput,
        error: this.buildPreflightError(artifact, targetExists)
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

    if (request.targetKind === "file" && await this.sourceRequiresInput(targetPath)) {
      const started = await this.interactiveSessions.start(settings.execution.javaCommand, args, workingDirectory, targetPath);
      const parsedOutput = this.outputParser.parse(`${started.stdout}\n${started.stderr}`);
      const result: CompilerExecutionResult = {
        success: false,
        command: settings.execution.javaCommand,
        args,
        workingDirectory,
        stdout: started.stdout,
        stderr: started.stderr,
        exitCode: null,
        durationMs: Date.now() - new Date(startedAt).getTime(),
        repositoryPath: artifact.repositoryPath,
        compilerArtifactPath: artifact.artifactPath,
        interactive: started.started,
        targetPath,
        targetKind: request.targetKind,
        parsedOutput
      };
      this.lastResult = result;
      await this.storeSession(result);
      return result;
    }

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
          repositoryPath: artifact.repositoryPath,
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
    const normalized = this.resultNormalizer.normalize(result.stdout, result.stderr || result.error || "", result.interactive);
    this.lastSession = this.sessionMapper.toSession(result, diagnostics, artifacts, normalized, {
      startedAt: this.status.startedAt,
      completedAt: this.status.completedAt
    });
  }

  private buildPreflightError(artifact: CompilerArtifactResolution, targetExists: boolean): string {
    const errors: string[] = [];
    if (!artifact.found) errors.push(artifact.message);
    if (!targetExists) errors.push("Compiler target path does not exist.");
    return errors.join(" ");
  }

  private async sourceRequiresInput(targetPath: string): Promise<boolean> {
    try {
      return /\bREAD\b/.test(await this.fileSystem.readText(targetPath));
    } catch {
      return false;
    }
  }
}

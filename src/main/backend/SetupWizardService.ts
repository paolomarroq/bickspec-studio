import { spawn } from "node:child_process";
import { basename, dirname, extname, join, resolve } from "node:path";
import { BrowserWindow, dialog } from "electron";
import type {
  SetupState,
  SetupValidationResult
} from "@shared/contracts/backend";
import type { SetupCompilationResult, SetupInteractiveResult } from "@shared/contracts/setup";
import type { BickSpecReportData } from "@shared/contracts/reports";
import { extractPlainProgramOutput } from "@shared/reports/runtimeOutput";
import { BackendSettingsService } from "./BackendSettingsService";
import { CompilerExecutionService } from "./CompilerExecutionService";
import { CompilerRepositoryResolver } from "./CompilerRepositoryResolver";
import { FileSystemService } from "./FileSystemService";
import { ProcessExecutionService } from "./ProcessExecutionService";
import { ReportExportService } from "./ReportExportService";

const compilationSource = `PROJECT "Studio Setup Test" {
  A := 10
  B := 3
  RESULTADO := (A + B) * 2 / 5

  DISPLAY "Resultado:"
  DISPLAY RESULTADO
}
`;

const interactiveSource = `PROJECT "Studio Interactive Test" {
  DISPLAY "Ingrese tasa:"
  READ R

  DISPLAY "Valor ingresado:"
  DISPLAY R
}
`;

export class SetupWizardService {
  constructor(
    private readonly settings: BackendSettingsService,
    private readonly fileSystem: FileSystemService,
    private readonly processExecution: ProcessExecutionService,
    private readonly repositoryResolver: CompilerRepositoryResolver,
    private readonly compilerExecution: CompilerExecutionService,
    private readonly reportExport: ReportExportService
  ) {}

  async getState(): Promise<SetupState> {
    return (await this.settings.getSettings()).setup;
  }

  async saveState(patch: Partial<SetupState>): Promise<SetupState> {
    return (await this.settings.patchSetupState(patch)).setup;
  }

  async reset(): Promise<SetupState> {
    return (await this.settings.patchSetupState({
      setupCompleted: false,
      setupSkipped: false,
      documentationShown: false,
      javaPath: undefined,
      compilerRepoPath: undefined,
      compilerJarPath: undefined,
      workspacePath: undefined,
      outputDirectory: undefined,
      lastValidationResults: {},
      lastSetupCompletedAt: undefined
    })).setup;
  }

  async skip(): Promise<SetupState> {
    return this.saveState({ setupSkipped: true });
  }

  async finish(): Promise<SetupState> {
    return this.saveState({
      setupCompleted: true,
      setupSkipped: false,
      lastSetupCompletedAt: new Date().toISOString()
    });
  }

  async validateJava(javaPath?: string): Promise<SetupValidationResult> {
    const currentSettings = await this.settings.getSettings();
    const command = javaPath || currentSettings.setup.javaPath || currentSettings.execution.javaCommand;
    const availability = await this.processExecution.checkTool(command, ["-version"]);
    const versionMatch = `${availability.version ?? ""} ${availability.error ?? ""}`.match(/version\s+"?(\d+)/i);
    const version = versionMatch?.[1];
    const result: SetupValidationResult = !availability.available
      ? {
          status: "error",
          message: "Java was not found.",
          suggestion: "Install Java 21 or select a Java executable.",
          rawOutput: availability.error,
          details: { command }
        }
      : version === "21"
        ? {
            status: "success",
            message: "Java 21 detected.",
            rawOutput: availability.version,
            details: { command, version }
          }
        : {
            status: "warning",
            message: version ? `Java ${version} detected.` : "Java detected.",
            suggestion: "Java 21 is recommended.",
            rawOutput: availability.version,
            details: { command, version }
          };
    const nextSettings = await this.settings.getSettings();
    await this.settings.saveSettings({
      ...nextSettings,
      execution: {
        ...nextSettings.execution,
        javaCommand: javaPath || nextSettings.setup.javaPath || nextSettings.execution.javaCommand
      },
      setup: {
        ...nextSettings.setup,
        javaPath: javaPath || nextSettings.setup.javaPath,
        lastValidationResults: {
          ...nextSettings.setup.lastValidationResults,
          java: result
        }
      }
    });
    return result;
  }

  async selectJava(): Promise<string | null> {
    const selected = await this.chooseFile("Select Java Executable", process.platform === "win32" ? ["exe"] : ["*"]);
    if (selected) await this.saveState({ javaPath: selected });
    return selected;
  }

  async selectCompilerRepo(): Promise<string | null> {
    const selected = await this.chooseDirectory("Select bickspec-lang Repository");
    if (selected) await this.saveState({ compilerRepoPath: selected });
    return selected;
  }

  async getConfiguredRepoUrl(): Promise<string> {
    return (await this.settings.getSettings()).compiler.repositoryUrl ?? "https://github.com/paolomarroq/bickspec-lang";
  }

  async validateGit(): Promise<SetupValidationResult> {
    const git = await this.processExecution.checkTool("git", ["--version"]);
    return git.available
      ? {
          status: "success",
          message: git.version ?? "Git detected.",
          rawOutput: git.version
        }
      : {
          status: "error",
          message: "Git was not found.",
          suggestion: "Install Git or select an existing local bickspec-lang repository.",
          rawOutput: git.error
        };
  }

  async cloneCompilerRepo(): Promise<SetupValidationResult> {
    const git = await this.validateGit();
    if (git.status === "error") {
      await this.saveState({ lastValidationResults: { compilerRepo: git } });
      return git;
    }

    const parentFolder = await this.chooseDirectory(
      "Select parent folder where bickspec-lang will be cloned",
      "Select Parent Folder"
    );
    if (!parentFolder) {
      return { status: "warning", message: "Repository clone was cancelled." };
    }

    const normalizedParent = resolve(parentFolder);
    const repoRootAncestor = await this.findRepositoryAncestor(normalizedParent);
    if (repoRootAncestor && repoRootAncestor !== normalizedParent) {
      const result: SetupValidationResult = {
        status: "warning",
        message: "This folder appears to be inside an existing bickspec-lang repository. Select the repository root or its parent folder."
      };
      await this.saveState({ lastValidationResults: { compilerRepo: result } });
      return result;
    }

    const parentIsRepoRoot = await this.isRepositoryRoot(normalizedParent);
    if (basename(normalizedParent).toLowerCase() === "bickspec-lang" && parentIsRepoRoot) {
      const result = await this.useExistingRepository(normalizedParent, "Repository already exists and is valid.");
      return result;
    }

    const targetPath = join(normalizedParent, "bickspec-lang");
    if (await this.fileSystem.exists(targetPath)) {
      if (await this.isRepositoryRoot(targetPath)) {
        return this.useExistingRepository(targetPath, "Repository already exists and is valid.");
      }
      const entries = await this.fileSystem.listDirectory(targetPath);
      if (entries.length > 0) {
        const result: SetupValidationResult = {
          status: "error",
          message: "Clone target already exists and is not a valid bickspec-lang repository.",
          suggestion: "Choose another parent folder or use Browse Repository for an existing checkout."
        };
        await this.saveState({ lastValidationResults: { compilerRepo: result } });
        return result;
      }
    }

    const clone = await this.runCommand("git", ["clone", await this.getConfiguredRepoUrl(), targetPath], normalizedParent);
    if (clone.exitCode !== 0) {
      const result: SetupValidationResult = {
        status: "error",
        message: "Git clone failed.",
        suggestion: "Check your Git installation, network access, and destination folder.",
        rawOutput: clone.output
      };
      await this.saveState({ lastValidationResults: { compilerRepo: result } });
      return result;
    }

    const validation = await this.validateCompilerRepo(targetPath);
    const artifact = await this.repositoryResolver.resolveArtifact(targetPath);
    const result: SetupValidationResult = artifact.artifactPath
      ? {
          ...validation,
          rawOutput: clone.output,
          message: "Repository cloned and compiler JAR detected."
        }
      : {
          ...validation,
          rawOutput: clone.output,
          message: validation.status === "success"
            ? "Repository cloned. Compiler JAR not found. Build from repository is required."
            : validation.message,
          suggestion: validation.status === "success"
            ? "Continue to Compiler JAR and use Build from Repository."
            : validation.suggestion
        };
    await this.saveState({
      compilerRepoPath: targetPath,
      compilerJarPath: artifact.artifactPath,
      lastValidationResults: { compilerRepo: result }
    });
    return result;
  }

  async updateCompilerRepo(): Promise<SetupValidationResult> {
    const current = await this.settings.getSettings();
    const repoPath = current.setup.compilerRepoPath || current.compiler.repositoryPath;
    const validation = await this.validateCompilerRepo(repoPath);
    if (validation.status !== "success") return validation;
    const status = await this.runCommand("git", ["status", "--porcelain"], repoPath);
    if (status.exitCode !== 0) {
      return {
        status: "error",
        message: "Unable to inspect repository status.",
        rawOutput: status.output
      };
    }
    if (status.output.trim()) {
      return {
        status: "warning",
        message: "Repository has local changes. Update was not run.",
        suggestion: "Commit or stash local changes before pulling."
      };
    }
    const pull = await this.runCommand("git", ["pull"], repoPath);
    const result: SetupValidationResult = pull.exitCode === 0
      ? { status: "success", message: "Repository updated.", rawOutput: pull.output }
      : { status: "error", message: "Repository update failed.", rawOutput: pull.output };
    await this.saveState({ lastValidationResults: { compilerRepo: result } });
    return result;
  }

  async validateCompilerRepo(repositoryPath?: string): Promise<SetupValidationResult> {
    const current = await this.settings.getSettings();
    const selectedPath = repositoryPath || current.setup.compilerRepoPath || current.compiler.repositoryPath;
    const normalized = resolve(selectedPath);
    const leaf = basename(normalized).toLowerCase();
    const expectedPom = join(normalized, "app", "pom.xml");
    const expectedSrc = join(normalized, "app", "src");
    const isObviousSubfolder = ["testing", "output", "app", "target"].includes(leaf) || normalized.toLowerCase().endsWith(join("app", "target").toLowerCase());
    const hasPom = await this.fileSystem.isFile(expectedPom);
    const hasSrc = await this.fileSystem.isDirectory(expectedSrc);
    const validation = await this.repositoryResolver.validate(normalized);
    const result: SetupValidationResult = isObviousSubfolder || (!hasPom && await this.fileSystem.isFile(join(dirname(normalized), "app", "pom.xml")))
      ? {
          status: "error",
          message: "This looks like a subfolder. Please select the bickspec-lang repository root.",
          suggestion: "Choose the folder that contains app/pom.xml."
        }
      : validation.isValid && hasPom && hasSrc
        ? {
            status: "success",
            message: "Linked bickspec-lang repository detected.",
            details: {
              repositoryPath: normalized,
              hasPom,
              hasSrc,
              hasGit: await this.fileSystem.exists(join(normalized, ".git")),
              hasReadme: await this.fileSystem.exists(join(normalized, "README.md"))
            }
          }
        : {
            status: "error",
            message: "Please select the bickspec-lang repository root.",
            suggestion: "The selected folder should contain app/pom.xml and app/src."
          };
    const artifact = await this.repositoryResolver.resolveArtifact(normalized);
    if (result.status === "success") {
      await this.settings.setLinkedCompilerPath(normalized);
    }
    await this.saveState({
      compilerRepoPath: normalized,
      compilerJarPath: artifact.artifactPath || current.setup.compilerJarPath,
      lastValidationResults: { compilerRepo: result }
    });
    return result;
  }

  async selectCompilerJar(): Promise<string | null> {
    const selected = await this.chooseFile("Select BickSpec Compiler JAR", ["jar"]);
    if (selected) await this.saveState({ compilerJarPath: selected });
    return selected;
  }

  async validateCompilerJar(jarPath?: string): Promise<SetupValidationResult> {
    const current = await this.settings.getSettings();
    const selectedPath = jarPath || current.setup.compilerJarPath || current.compiler.preferredArtifactPath;
    if (!selectedPath || !(await this.fileSystem.isFile(selectedPath)) || extname(selectedPath).toLowerCase() !== ".jar") {
      const result = {
        status: "error" as const,
        message: "Compiler JAR was not found.",
        suggestion: "Browse to bickspec-compiler-1.0.0.jar or build it from the linked repository."
      };
      await this.saveState({ lastValidationResults: { compilerJar: result } });
      return result;
    }
    const java = await this.validateJava();
    const result: SetupValidationResult = java.status === "error"
      ? {
          status: "error",
          message: "Compiler JAR exists, but Java is unavailable.",
          suggestion: java.suggestion
        }
      : {
          status: "success",
          message: `${basename(selectedPath)} is ready for setup compilation.`,
          details: { compilerJarPath: selectedPath }
        };
    const next = await this.settings.getSettings();
    await this.settings.saveSettings({
      ...next,
      compiler: {
        ...next.compiler,
        preferredArtifactPath: selectedPath
      },
      setup: {
        ...next.setup,
        compilerJarPath: selectedPath,
        lastValidationResults: {
          ...next.setup.lastValidationResults,
          compilerJar: result
        }
      }
    });
    return result;
  }

  async buildCompilerFromRepo(): Promise<SetupValidationResult> {
    const current = await this.settings.getSettings();
    const repoPath = current.setup.compilerRepoPath || current.compiler.repositoryPath;
    const result = await this.runCommand(current.execution.mavenCommand, ["-f", join(repoPath, "app", "pom.xml"), "package"], repoPath);
    const artifact = await this.repositoryResolver.resolveArtifact(repoPath);
    const validation: SetupValidationResult = result.exitCode === 0 && artifact.artifactPath
      ? {
          status: "success",
          message: "Compiler build completed successfully.",
          rawOutput: result.output,
          details: { compilerJarPath: artifact.artifactPath }
        }
      : {
          status: "error",
          message: "Compiler build failed.",
          suggestion: "Verify Maven is installed and the linked repository builds from app/pom.xml.",
          rawOutput: result.output
        };
    await this.saveState({
      compilerJarPath: artifact.artifactPath || current.setup.compilerJarPath,
      lastValidationResults: { compilerJar: validation }
    });
    return validation;
  }

  async selectWorkspace(): Promise<string | null> {
    const selected = await this.chooseDirectory("Select Workspace Folder");
    if (selected) await this.saveState({ workspacePath: selected });
    return selected;
  }

  async validateWorkspace(workspacePath?: string): Promise<SetupValidationResult> {
    const current = await this.settings.getSettings();
    const selectedPath = workspacePath || current.setup.workspacePath;
    if (!selectedPath || !(await this.fileSystem.isDirectory(selectedPath))) {
      const result = {
        status: "error" as const,
        message: "Workspace folder was not found.",
        suggestion: "Choose an existing writable folder."
      };
      await this.saveState({ lastValidationResults: { workspace: result } });
      return result;
    }
    try {
      const setupFolder = join(selectedPath, ".bickspec", "setup");
      await this.fileSystem.writeText(join(setupFolder, ".write-test"), "ok");
      const entries = await this.fileSystem.listDirectory(selectedPath);
      const bksCount = entries.filter((entry) => entry.isFile && entry.name.toLowerCase().endsWith(".bks")).length;
      const result: SetupValidationResult = {
        status: "success",
        message: "Workspace is writable and ready.",
        details: { workspacePath: selectedPath, bksFilesDiscovered: bksCount }
      };
      await this.saveState({
        workspacePath: selectedPath,
        outputDirectory: join(selectedPath, ".bickspec", "setup"),
        lastValidationResults: { workspace: result }
      });
      return result;
    } catch (error) {
      const result = {
        status: "error" as const,
        message: "Workspace is not writable.",
        suggestion: "Verify file permissions and workspace path.",
        rawOutput: error instanceof Error ? error.message : String(error)
      };
      await this.saveState({ lastValidationResults: { workspace: result } });
      return result;
    }
  }

  async runCompilationTest(): Promise<SetupCompilationResult> {
    const testPath = await this.writeSetupSource("Studio_Setup_Test.bks", compilationSource);
    const execution = await this.compilerExecution.executeCompilerTarget({ targetPath: testPath, targetKind: "file" });
    const session = this.compilerExecution.getLastSession();
    const programOutput = session?.normalized.programOutput ?? "";
    const plainOutput = extractPlainProgramOutput(programOutput);
    const passed = execution.success && plainOutput.includes("Resultado:") && plainOutput.includes("5.2");
    const result: SetupCompilationResult = {
      status: passed ? "success" : "error",
      message: passed ? "Real setup compilation passed." : "Setup compilation did not produce the expected runtime output.",
      suggestion: passed ? undefined : "Verify the linked compiler JAR and build log.",
      rawOutput: `${execution.stdout}\n${execution.stderr}`.trim(),
      buildLog: session?.normalized.buildLog,
      programOutput,
      diagnostics: session?.diagnostics,
      artifacts: session?.artifacts
    };
    await this.saveState({ lastValidationResults: { compilation: result } });
    return result;
  }

  async runInteractiveTest(): Promise<SetupInteractiveResult> {
    const testPath = await this.writeSetupSource("Studio_Interactive_Test.bks", interactiveSource);
    await this.compilerExecution.executeCompilerTarget({ targetPath: testPath, targetKind: "file" });
    const session = this.compilerExecution.getInteractiveSessionState();
    const result: SetupInteractiveResult = session.active
      ? { status: "success", message: "Interactive session started.", session }
      : {
          status: "error",
          message: "Interactive session did not start.",
          suggestion: "Verify that the linked compiler can execute READ programs.",
          session
        };
    await this.saveState({ lastValidationResults: { interactive: result } });
    return result;
  }

  async validateArtifacts(): Promise<SetupValidationResult> {
    const session = this.compilerExecution.getLastSession();
    const artifacts = session?.artifacts.artifacts ?? [];
    const found = new Set(artifacts.filter((artifact) => artifact.exists).map((artifact) => artifact.type));
    const required = ["symbols", "tree-svg", "java", "class"];
    const missing = required.filter((type) => !found.has(type as never));
    const result: SetupValidationResult = session
      ? {
          status: missing.length === 0 ? "success" : "warning",
          message: missing.length === 0 ? "Core artifacts discovered." : `Artifacts checked; missing ${missing.join(", ")}.`,
          suggestion: missing.length === 0 ? undefined : "Run the setup compilation test again after compiler outputs are enabled.",
          details: {
            artifactsFound: artifacts.filter((artifact) => artifact.exists).length,
            reportPreviewAvailable: true,
            pdfExportAvailable: true,
            excelExportAvailable: true,
            csvExportAvailable: true
          }
        }
      : {
          status: "error",
          message: "No compiler session is available for artifact validation.",
          suggestion: "Run the setup compilation test first."
        };
    await this.saveState({ lastValidationResults: { artifacts: result, reports: result } });
    return result;
  }

  async testReportExport(): Promise<SetupValidationResult> {
    const session = this.compilerExecution.getLastSession();
    if (!session) {
      const result = {
        status: "error" as const,
        message: "No compiler session is available for report export.",
        suggestion: "Run the setup compilation test first."
      };
      await this.saveState({ lastValidationResults: { reports: result } });
      return result;
    }
    const directory = await this.chooseDirectory("Choose Folder for Test Report Exports");
    if (!directory) {
      return {
        status: "warning",
        message: "Report export test was cancelled."
      };
    }
    try {
      const report = this.buildReportFromSession(session);
      const files = await this.reportExport.exportAllToDirectory(report, directory);
      const result: SetupValidationResult = {
        status: "success",
        message: "PDF, Excel, and CSV test exports were created.",
        details: { exportCount: files.length }
      };
      await this.saveState({ lastValidationResults: { reports: result } });
      return result;
    } catch (error) {
      const result = {
        status: "error" as const,
        message: "Report export test failed.",
        suggestion: "Verify the selected folder is writable.",
        rawOutput: error instanceof Error ? error.message : String(error)
      };
      await this.saveState({ lastValidationResults: { reports: result } });
      return result;
    }
  }

  private async writeSetupSource(fileName: string, source: string): Promise<string> {
    const current = await this.settings.getSettings();
    const root = current.setup.workspacePath || dirname(this.settings.settingsPath);
    const filePath = join(root, ".bickspec", "setup", fileName);
    await this.fileSystem.writeText(filePath, source);
    return filePath;
  }

  private buildReportFromSession(session: NonNullable<ReturnType<CompilerExecutionService["getLastSession"]>>): BickSpecReportData {
    const interactive = session.summary.interactive;
    const interactiveState = this.compilerExecution.getInteractiveSessionState();
    return {
      reportId: `setup-${Date.now()}`,
      title: basename(session.summary.targetPath),
      sourceName: basename(session.summary.targetPath),
      sourcePath: session.summary.targetPath,
      generatedAt: new Date().toISOString(),
      status: interactive ? (interactiveState.status === "completed" ? "interactive-completed" : "interactive") : session.summary.success ? "success" : "failed",
      interactive,
      targetKind: session.summary.targetKind,
      diagnostics: session.diagnostics,
      artifacts: session.artifacts.artifacts,
      programOutput: session.normalized.programOutput,
      interactiveTranscript: interactiveState.transcript,
      interactiveEntries: interactiveState.entries,
      buildLog: session.normalized.buildLog
    };
  }

  private async chooseDirectory(title: string, buttonLabel?: string): Promise<string | null> {
    const result = await dialog.showOpenDialog(this.parentWindow(), { title, buttonLabel, properties: ["openDirectory"] });
    return result.canceled ? null : result.filePaths[0] ?? null;
  }

  private async chooseFile(title: string, extensions: string[]): Promise<string | null> {
    const result = await dialog.showOpenDialog(this.parentWindow(), {
      title,
      properties: ["openFile"],
      filters: [{ name: title, extensions }]
    });
    return result.canceled ? null : result.filePaths[0] ?? null;
  }

  private parentWindow(): BrowserWindow {
    return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  }

  private runCommand(command: string, args: string[], cwd: string): Promise<{ exitCode: number | null; output: string }> {
    return new Promise((resolve) => {
      const child = spawn(command, args, { cwd, windowsHide: true });
      let output = "";
      child.stdout.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      child.stderr.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      child.on("error", (error) => resolve({ exitCode: null, output: error.message }));
      child.on("close", (exitCode) => resolve({ exitCode, output: output.trim() }));
    });
  }

  private async isRepositoryRoot(path: string): Promise<boolean> {
    return (await this.fileSystem.isFile(join(path, "app", "pom.xml"))) && (await this.fileSystem.isDirectory(join(path, "app", "src")));
  }

  private async findRepositoryAncestor(startPath: string): Promise<string | null> {
    let current = resolve(startPath);
    while (dirname(current) !== current) {
      if (await this.isRepositoryRoot(current)) return current;
      current = dirname(current);
    }
    return null;
  }

  private async useExistingRepository(path: string, message: string): Promise<SetupValidationResult> {
    const validation = await this.validateCompilerRepo(path);
    const artifact = await this.repositoryResolver.resolveArtifact(path);
    const result: SetupValidationResult = {
      ...validation,
      message: artifact.artifactPath ? `${message} Compiler JAR detected.` : `${message} Compiler JAR not found. Build from repository is required.`,
      suggestion: artifact.artifactPath ? validation.suggestion : "Continue to Compiler JAR and use Build from Repository."
    };
    await this.saveState({
      compilerRepoPath: path,
      compilerJarPath: artifact.artifactPath,
      lastValidationResults: { compilerRepo: result }
    });
    return result;
  }
}

import type { BackendStatus, CompilerRepositoryConfig, CompilerRepositoryValidation } from "@shared/contracts/backend";
import { BackendSettingsService } from "./BackendSettingsService";
import { CompilerRepositoryResolver } from "./CompilerRepositoryResolver";
import { ProcessExecutionService } from "./ProcessExecutionService";

export class CompilerBridgeService {
  constructor(
    private readonly settingsService: BackendSettingsService,
    private readonly repositoryResolver: CompilerRepositoryResolver,
    private readonly processExecution: ProcessExecutionService
  ) {}

  async getLinkedCompilerConfig(): Promise<CompilerRepositoryConfig> {
    return (await this.settingsService.getSettings()).compiler;
  }

  async validateCompilerRepository(repositoryPath: string): Promise<CompilerRepositoryValidation> {
    const settings = await this.settingsService.getSettings();
    return this.repositoryResolver.validate(repositoryPath, settings.compiler.preferredArtifactPath);
  }

  async getBackendStatus(): Promise<BackendStatus> {
    const settings = await this.settingsService.getSettings();
    const [compilerRepository, java, maven] = await Promise.all([
      this.repositoryResolver.validate(settings.compiler.repositoryPath, settings.compiler.preferredArtifactPath),
      this.processExecution.checkTool(settings.execution.javaCommand, ["-version"]),
      this.processExecution.checkTool(settings.execution.mavenCommand, ["-version"])
    ]);

    return {
      compilerRepository,
      java,
      maven,
      settingsPath: this.settingsService.settingsPath,
      defaultCompilerRepositoryPath: this.settingsService.getDefaultCompilerRepositoryPath()
    };
  }
}


import type { WorkspaceInfo } from "@shared/contracts/backend";
import { BackendSettingsService } from "./BackendSettingsService";

export class ProjectWorkspaceService {
  constructor(
    private readonly appRootPath: string,
    private readonly settingsService: BackendSettingsService
  ) {}

  async getWorkspaceInfo(): Promise<WorkspaceInfo> {
    const settings = await this.settingsService.getSettings();

    return {
      appRootPath: this.appRootPath,
      defaultCompilerRepositoryPath: this.settingsService.getDefaultCompilerRepositoryPath(),
      configuredCompilerRepositoryPath: settings.compiler.repositoryPath,
      settingsPath: this.settingsService.settingsPath
    };
  }
}

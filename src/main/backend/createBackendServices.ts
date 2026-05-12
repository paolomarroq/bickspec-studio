import type { App } from "electron";
import { BackendSettingsService } from "./BackendSettingsService";
import { CompilerBridgeService } from "./CompilerBridgeService";
import { CompilerRepositoryResolver } from "./CompilerRepositoryResolver";
import { FileSystemService } from "./FileSystemService";
import { ProcessExecutionService } from "./ProcessExecutionService";
import { ProjectWorkspaceService } from "./ProjectWorkspaceService";

export interface BackendServices {
  compilerBridge: CompilerBridgeService;
  settings: BackendSettingsService;
  workspace: ProjectWorkspaceService;
}

export function createBackendServices(app: App, appRootPath: string): BackendServices {
  const fileSystem = new FileSystemService();
  const processExecution = new ProcessExecutionService();
  const settings = new BackendSettingsService(app, fileSystem, appRootPath);
  const repositoryResolver = new CompilerRepositoryResolver(fileSystem);

  return {
    compilerBridge: new CompilerBridgeService(settings, repositoryResolver, processExecution),
    settings,
    workspace: new ProjectWorkspaceService(appRootPath, settings)
  };
}


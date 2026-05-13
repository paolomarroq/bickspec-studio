import type { App } from "electron";
import { BackendSettingsService } from "./BackendSettingsService";
import { CompilerBridgeService } from "./CompilerBridgeService";
import { CompilerExecutionService } from "./CompilerExecutionService";
import { CompilerOutputParser } from "./CompilerOutputParser";
import { CompilerRepositoryResolver } from "./CompilerRepositoryResolver";
import { FileSystemService } from "./FileSystemService";
import { ProcessExecutionService } from "./ProcessExecutionService";
import { ProjectWorkspaceService } from "./ProjectWorkspaceService";

export interface BackendServices {
  compilerBridge: CompilerBridgeService;
  compilerExecution: CompilerExecutionService;
  settings: BackendSettingsService;
  workspace: ProjectWorkspaceService;
}

export function createBackendServices(app: App, appRootPath: string): BackendServices {
  const fileSystem = new FileSystemService();
  const processExecution = new ProcessExecutionService();
  const outputParser = new CompilerOutputParser();
  const settings = new BackendSettingsService(app, fileSystem, appRootPath);
  const repositoryResolver = new CompilerRepositoryResolver(fileSystem);

  return {
    compilerBridge: new CompilerBridgeService(settings, repositoryResolver, processExecution),
    compilerExecution: new CompilerExecutionService(settings, repositoryResolver, processExecution, fileSystem, outputParser),
    settings,
    workspace: new ProjectWorkspaceService(appRootPath, settings)
  };
}

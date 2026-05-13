import type { App } from "electron";
import { ArtifactAccessService } from "./ArtifactAccessService";
import { ArtifactDiscoveryService } from "./ArtifactDiscoveryService";
import { AppWorkspaceService } from "./AppWorkspaceService";
import { BackendSettingsService } from "./BackendSettingsService";
import { CompilerBridgeService } from "./CompilerBridgeService";
import { CompilerDiagnosticsParser } from "./CompilerDiagnosticsParser";
import { CompilerExecutionService } from "./CompilerExecutionService";
import { CompilerOutputParser } from "./CompilerOutputParser";
import { CompilerRepositoryResolver } from "./CompilerRepositoryResolver";
import { CompilerSessionMapper } from "./CompilerSessionMapper";
import { FileSystemService } from "./FileSystemService";
import { ProcessExecutionService } from "./ProcessExecutionService";
import { ProjectWorkspaceService } from "./ProjectWorkspaceService";

export interface BackendServices {
  compilerBridge: CompilerBridgeService;
  compilerExecution: CompilerExecutionService;
  appWorkspace: AppWorkspaceService;
  settings: BackendSettingsService;
  workspace: ProjectWorkspaceService;
}

export function createBackendServices(app: App, appRootPath: string): BackendServices {
  const fileSystem = new FileSystemService();
  const processExecution = new ProcessExecutionService();
  const outputParser = new CompilerOutputParser();
  const diagnosticsParser = new CompilerDiagnosticsParser();
  const artifactDiscovery = new ArtifactDiscoveryService(fileSystem);
  const artifactAccess = new ArtifactAccessService(fileSystem);
  const sessionMapper = new CompilerSessionMapper();
  const settings = new BackendSettingsService(app, fileSystem, appRootPath);
  const repositoryResolver = new CompilerRepositoryResolver(fileSystem);

  return {
    compilerBridge: new CompilerBridgeService(settings, repositoryResolver, processExecution),
    compilerExecution: new CompilerExecutionService(
      settings,
      repositoryResolver,
      processExecution,
      fileSystem,
      outputParser,
      diagnosticsParser,
      artifactDiscovery,
      artifactAccess,
      sessionMapper
    ),
    appWorkspace: new AppWorkspaceService(settings, fileSystem),
    settings,
    workspace: new ProjectWorkspaceService(appRootPath, settings)
  };
}

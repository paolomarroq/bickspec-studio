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
import { CompilerResultNormalizer } from "./CompilerResultNormalizer";
import { CompilerSessionMapper } from "./CompilerSessionMapper";
import { FileSystemService } from "./FileSystemService";
import { ProcessExecutionService } from "./ProcessExecutionService";
import { ProjectWorkspaceService } from "./ProjectWorkspaceService";
import { InteractiveSessionManager } from "./InteractiveSessionManager";
import { ReportExportService } from "./ReportExportService";
import { SetupWizardService } from "./SetupWizardService";

export interface BackendServices {
  compilerBridge: CompilerBridgeService;
  compilerExecution: CompilerExecutionService;
  appWorkspace: AppWorkspaceService;
  settings: BackendSettingsService;
  workspace: ProjectWorkspaceService;
  reportExport: ReportExportService;
  setupWizard: SetupWizardService;
}

export function createBackendServices(app: App, appRootPath: string): BackendServices {
  const fileSystem = new FileSystemService();
  const processExecution = new ProcessExecutionService();
  const outputParser = new CompilerOutputParser();
  const diagnosticsParser = new CompilerDiagnosticsParser();
  const artifactDiscovery = new ArtifactDiscoveryService(fileSystem);
  const artifactAccess = new ArtifactAccessService(fileSystem);
  const sessionMapper = new CompilerSessionMapper();
  const resultNormalizer = new CompilerResultNormalizer();
  const interactiveSessions = new InteractiveSessionManager();
  const reportExport = new ReportExportService();
  const settings = new BackendSettingsService(app, fileSystem, appRootPath);
  const repositoryResolver = new CompilerRepositoryResolver(fileSystem, appRootPath);
  const compilerExecution = new CompilerExecutionService(
    settings,
    repositoryResolver,
    processExecution,
    fileSystem,
    outputParser,
    diagnosticsParser,
    artifactDiscovery,
    artifactAccess,
    sessionMapper,
    resultNormalizer,
    interactiveSessions
  );

  return {
    compilerBridge: new CompilerBridgeService(settings, repositoryResolver, processExecution),
    compilerExecution,
    appWorkspace: new AppWorkspaceService(settings, fileSystem, appRootPath),
    settings,
    workspace: new ProjectWorkspaceService(appRootPath, settings),
    reportExport,
    setupWizard: new SetupWizardService(settings, fileSystem, processExecution, repositoryResolver, compilerExecution, reportExport)
  };
}

import type {
  CompileResult,
  GeneratedArtifact,
  ProjectFile,
  ReportPreview,
  ReportExportRequest,
  StudioProject,
  StudioSettings
} from "./domain";

export interface CompilerService {
  compile(projectId: string): Promise<CompileResult>;
  run(projectId: string): Promise<CompileResult>;
}

export interface ProjectService {
  listRecentProjects(): Promise<StudioProject[]>;
  getCurrentProject(): Promise<StudioProject>;
  listProjectFiles(projectId: string): Promise<ProjectFile[]>;
  createProject(name: string): Promise<StudioProject>;
  openProject(path: string): Promise<StudioProject>;
}

export interface ArtifactsService {
  listArtifacts(projectId: string): Promise<GeneratedArtifact[]>;
  revealArtifact(artifactId: string): Promise<void>;
}

export interface ReportService {
  getPreview(reportId: string): Promise<ReportPreview>;
  exportReport(request: ReportExportRequest): Promise<GeneratedArtifact>;
}

export interface SettingsService {
  getSettings(): Promise<StudioSettings>;
  saveSettings(settings: StudioSettings): Promise<StudioSettings>;
}

export interface StudioServices {
  compiler: CompilerService;
  projects: ProjectService;
  artifacts: ArtifactsService;
  reports: ReportService;
  settings: SettingsService;
}

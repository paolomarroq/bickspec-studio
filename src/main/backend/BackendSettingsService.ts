import { join, resolve } from "node:path";
import type { App } from "electron";
import type { BackendSettings } from "@shared/contracts/backend";
import { FileSystemService } from "./FileSystemService";

export class BackendSettingsService {
  readonly settingsPath: string;

  constructor(
    private readonly app: App,
    private readonly fileSystem: FileSystemService,
    private readonly appRootPath: string
  ) {
    this.settingsPath = join(this.app.getPath("userData"), "backend-settings.json");
  }

  getDefaultCompilerRepositoryPath(): string {
    return resolve(this.appRootPath, "..", "bickspec-lang");
  }

  getDefaultSettings(): BackendSettings {
    return {
      compiler: {
        repositoryPath: process.env.BICKSPEC_LANG_REPOSITORY ?? this.getDefaultCompilerRepositoryPath()
      },
      execution: {
        javaCommand: process.env.JAVA_COMMAND ?? "java",
        mavenCommand: process.env.MAVEN_COMMAND ?? "mvn"
      },
      workspace: {
        defaultOutputDirectory: "generated",
        preserveGeneratedArtifacts: true
      }
    };
  }

  async getSettings(): Promise<BackendSettings> {
    const stored = await this.fileSystem.readJson<Partial<BackendSettings>>(this.settingsPath);
    const defaults = this.getDefaultSettings();

    return {
      compiler: {
        ...defaults.compiler,
        ...stored?.compiler
      },
      execution: {
        ...defaults.execution,
        ...stored?.execution
      },
      workspace: {
        ...defaults.workspace,
        ...stored?.workspace
      }
    };
  }

  async saveSettings(settings: BackendSettings): Promise<BackendSettings> {
    await this.fileSystem.writeJson(this.settingsPath, settings);
    return settings;
  }

  async setLinkedCompilerPath(repositoryPath: string): Promise<BackendSettings> {
    const settings = await this.getSettings();
    const nextSettings: BackendSettings = {
      ...settings,
      compiler: {
        ...settings.compiler,
        repositoryPath: resolve(repositoryPath)
      }
    };
    return this.saveSettings(nextSettings);
  }
}


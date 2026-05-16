import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
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
    const projectLocalLinkedRepository = resolve(this.appRootPath, "bickspec-lang");
    return existsSync(projectLocalLinkedRepository) ? projectLocalLinkedRepository : this.getFallbackSiblingCompilerRepositoryPath();
  }

  getFallbackSiblingCompilerRepositoryPath(): string {
    return resolve(this.appRootPath, "..", "bickspec-lang");
  }

  getDefaultSettings(): BackendSettings {
    return {
      compiler: {
        repositoryPath: process.env.BICKSPEC_LANG_REPOSITORY ?? this.getDefaultCompilerRepositoryPath(),
        repositoryUrl: process.env.BICKSPEC_LANG_REPOSITORY_URL ?? "https://github.com/paolomarroq/bickspec-lang"
      },
      execution: {
        javaCommand: process.env.JAVA_COMMAND ?? "java",
        mavenCommand: process.env.MAVEN_COMMAND ?? "mvn"
      },
      workspace: {
        defaultOutputDirectory: "generated",
        preserveGeneratedArtifacts: true
      },
      setup: {
        setupCompleted: false,
        setupSkipped: false,
        documentationShown: false,
        lastValidationResults: {}
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
      },
      setup: {
        ...defaults.setup,
        ...stored?.setup,
        lastValidationResults: {
          ...defaults.setup.lastValidationResults,
          ...stored?.setup?.lastValidationResults
        }
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

  async patchSetupState(patch: Partial<BackendSettings["setup"]>): Promise<BackendSettings> {
    const settings = await this.getSettings();
    return this.saveSettings({
      ...settings,
      setup: {
        ...settings.setup,
        ...patch,
        lastValidationResults: {
          ...settings.setup.lastValidationResults,
          ...patch.lastValidationResults
        }
      }
    });
  }
}

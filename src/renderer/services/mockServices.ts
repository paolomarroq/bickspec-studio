import type { StudioServices } from "@shared/contracts/services";
import { currentProject, diagnostics, generatedArtifacts, projectFiles, recentProjects, reportPreview } from "./mockData";

export const mockServices: StudioServices = {
  compiler: {
    async compile() {
      return {
        status: "succeeded",
        durationMs: 284,
        diagnostics
      };
    },
    async run(projectId) {
      return this.compile(projectId);
    }
  },
  projects: {
    async listRecentProjects() {
      return recentProjects;
    },
    async getCurrentProject() {
      return currentProject;
    },
    async listProjectFiles() {
      return projectFiles;
    },
    async createProject(name) {
      return { id: name.toLowerCase().replace(/\s+/g, "-"), name, path: "/projects/bickspec/new", modifiedAt: "Now" };
    },
    async openProject(path) {
      return { id: "opened", name: path.split("/").pop() ?? "opened-project", path, modifiedAt: "Now" };
    }
  },
  artifacts: {
    async listArtifacts() {
      return generatedArtifacts;
    },
    async revealArtifact() {
      return undefined;
    }
  },
  reports: {
    async getPreview() {
      return reportPreview;
    },
    async exportReport(request) {
      return {
        id: `${request.reportId}-${request.format}`,
        name: `portfolio-analysis-report.${request.format}`,
        kind: request.format,
        size: "244 KB",
        updatedAt: "Now"
      };
    }
  },
  settings: {
    async getSettings() {
      const raw = window.localStorage.getItem("bickspec-studio-settings");
      return raw ? JSON.parse(raw) : { theme: "light", compilerChannel: "stable", autoSave: true, telemetry: false };
    },
    async saveSettings(settings) {
      window.localStorage.setItem("bickspec-studio-settings", JSON.stringify(settings));
      return settings;
    }
  }
};

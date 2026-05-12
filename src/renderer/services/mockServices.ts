import type { StudioServices } from "@shared/contracts/services";
import { generatedArtifacts, recentProjects } from "./mockData";

export const mockServices: StudioServices = {
  compiler: {
    async compile() {
      return {
        status: "succeeded",
        durationMs: 284,
        diagnostics: [
          { severity: "info", message: "PortfolioAnalysis compiled with mock backend.", location: "portfolio-analysis.bks:1" },
          { severity: "warning", message: "Sensitivity range uses default confidence interval.", location: "portfolio-analysis.bks:24" }
        ]
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
      return "Mock report preview";
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
      return { theme: "light", compilerChannel: "stable", autoSave: true, telemetry: false };
    },
    async saveSettings(settings) {
      return settings;
    }
  }
};


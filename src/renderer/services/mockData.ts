import type { GeneratedArtifact, StudioProject } from "@shared/contracts/domain";

export const recentProjects: StudioProject[] = [
  { id: "portfolio", name: "portfolio-analysis.bks", path: "/projects/bickspec/fin-ops", modifiedAt: "2 mins ago" },
  { id: "cashflow", name: "cashflow-report.bks", path: "/projects/bickspec/accounting", modifiedAt: "4 hours ago" },
  { id: "loan", name: "loan-model.bks", path: "/projects/bickspec/mortgage", modifiedAt: "Yesterday" }
];

export const generatedArtifacts: GeneratedArtifact[] = [
  { id: "java", name: "PortfolioAnalysis.java", kind: "java", size: "18 KB", updatedAt: "10:42" },
  { id: "json", name: "compile-summary.json", kind: "json", size: "5 KB", updatedAt: "10:42" },
  { id: "pdf", name: "portfolio-analysis-report.pdf", kind: "pdf", size: "244 KB", updatedAt: "10:43" },
  { id: "csv", name: "cash-flow-table.csv", kind: "csv", size: "32 KB", updatedAt: "10:43" }
];


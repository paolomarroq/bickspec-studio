import type {
  CompileDiagnostic,
  GeneratedArtifact,
  ProjectFile,
  ReportPreview,
  StudioProject,
  TerminalEntry
} from "@shared/contracts/domain";

export const currentProject: StudioProject = {
  id: "portfolio-analysis",
  name: "portfolio-analysis.bks",
  path: "/Users/analyst/projects/bickspec/fin-ops",
  modifiedAt: "2 mins ago"
};

export const recentProjects: StudioProject[] = [
  currentProject,
  { id: "cashflow", name: "cashflow-report.bks", path: "/Users/analyst/projects/bick-spec/accounting", modifiedAt: "4 hours ago" },
  { id: "loan", name: "loan-model.bks", path: "/Users/analyst/projects/bick-spec/mortgage", modifiedAt: "Yesterday" },
  { id: "scenario", name: "rate-shock-scenarios.bks", path: "/Users/analyst/projects/bick-spec/risk", modifiedAt: "Apr 30" }
];

export const projectFiles: ProjectFile[] = [
  { id: "root", name: "fin-ops", path: "/", kind: "folder", depth: 0 },
  { id: "portfolio", name: "portfolio-analysis.bks", path: "/portfolio-analysis.bks", kind: "bks", depth: 1, status: "active" },
  { id: "inputs", name: "inputs", path: "/inputs", kind: "folder", depth: 1 },
  { id: "assets", name: "assets.csv", path: "/inputs/assets.csv", kind: "csv", depth: 2 },
  { id: "rates", name: "discount-rates.csv", path: "/inputs/discount-rates.csv", kind: "csv", depth: 2, status: "modified" },
  { id: "reports", name: "reports", path: "/reports", kind: "folder", depth: 1 },
  { id: "summary", name: "portfolio-summary.md", path: "/reports/portfolio-summary.md", kind: "markdown", depth: 2 },
  { id: "generated", name: "generated", path: "/generated", kind: "folder", depth: 1 },
  { id: "java", name: "PortfolioAnalysis.java", path: "/generated/PortfolioAnalysis.java", kind: "java", depth: 2, status: "generated" },
  { id: "symbols", name: "symbols.json", path: "/generated/symbols.json", kind: "json", depth: 2, status: "generated" },
  { id: "runlog", name: "run.log", path: "/generated/run.log", kind: "log", depth: 2, status: "generated" }
];

export const bickSpecLines = [
  "spec PortfolioAnalysis {",
  "  input assets: Array<Asset>;",
  "  input horizon: Duration = \"1y\";",
  "  input confidence: Percent = 95%;",
  "",
  "  calculate expected_return =",
  "    assets.sum(a => a.weight * a.cagr);",
  "",
  "  calculate weighted_volatility =",
  "    assets.sum(a => a.weight * a.volatility);",
  "",
  "  validate total_weight {",
  "    assets.sum(a => a.weight) == 1.0;",
  "  }",
  "",
  "  report PortfolioReport {",
  "    include expected_return;",
  "    include weighted_volatility;",
  "    export pdf, csv, excel;",
  "  }",
  "}"
];

export const generatedJavaLines = [
  "public final class PortfolioAnalysis {",
  "  public CompileResult run(PortfolioInputs inputs) {",
  "    BigDecimal expectedReturn = inputs.assets()",
  "      .stream()",
  "      .map(a -> a.weight().multiply(a.cagr()))",
  "      .reduce(BigDecimal.ZERO, BigDecimal::add);",
  "",
  "    validator.requireEqual(inputs.totalWeight(), ONE);",
  "    return CompileResult.success(expectedReturn);",
  "  }",
  "}"
];

export const diagnostics: CompileDiagnostic[] = [
  { severity: "info", message: "PortfolioAnalysis compiled with mock compiler adapter.", location: "portfolio-analysis.bks:1" },
  { severity: "warning", message: "Sensitivity range uses default confidence interval.", location: "portfolio-analysis.bks:4" },
  { severity: "info", message: "Generated Java target is compatible with future backend handoff.", location: "generated/PortfolioAnalysis.java" }
];

export const terminalEntries: TerminalEntry[] = [
  { level: "command", text: "> bickspec compile portfolio-analysis.bks --target java --report" },
  { level: "info", text: "[parser] loaded 21 lines and 4 financial declarations" },
  { level: "success", text: "[compiler] PortfolioAnalysis.java emitted" },
  { level: "success", text: "[artifacts] symbols.csv, syntax_tree.svg, analysis_report.pdf staged" },
  { level: "warning", text: "[diagnostics] confidence input is using workspace default" }
];

export const generatedArtifacts: GeneratedArtifact[] = [
  {
    id: "java",
    name: "PortfolioAnalysis.java",
    kind: "java",
    size: "18 KB",
    updatedAt: "10:42",
    label: "Java Output",
    status: "generated",
    preview: generatedJavaLines.join("\n")
  },
  {
    id: "symbols",
    name: "symbols.csv",
    kind: "csv",
    size: "6 KB",
    updatedAt: "10:42",
    label: "Symbol Table CSV",
    status: "generated",
    preview: "symbol,type,source\nexpected_return,Decimal,portfolio-analysis.bks:6\nweighted_volatility,Decimal,portfolio-analysis.bks:9"
  },
  {
    id: "tree",
    name: "syntax_tree.json",
    kind: "json",
    size: "11 KB",
    updatedAt: "10:43",
    label: "Parse Tree Results",
    status: "updated",
    preview: "{\n  \"spec\": \"PortfolioAnalysis\",\n  \"nodes\": [\"inputs\", \"calculations\", \"validations\", \"report\"]\n}"
  },
  {
    id: "pdf",
    name: "analysis_report.pdf",
    kind: "pdf",
    size: "244 KB",
    updatedAt: "10:43",
    label: "Execution Report",
    status: "generated",
    preview: "Portfolio Analysis Report ready for export."
  },
  {
    id: "excel",
    name: "cash-flow-table.xlsx",
    kind: "excel",
    size: "52 KB",
    updatedAt: "10:44",
    label: "Excel Workbook",
    status: "generated",
    preview: "Sheet: Cash Flow Table\nRows: 48\nScenario columns: Base, Downside, Upside"
  }
];

export const reportPreview: ReportPreview = {
  id: "portfolio-report",
  title: "Portfolio Analysis Report",
  status: "generated",
  generatedAt: "May 12, 2026 10:43",
  metrics: [
    { label: "Expected Return", value: "7.82%", tone: "accent" },
    { label: "Weighted Volatility", value: "11.4%" },
    { label: "Confidence", value: "95%" },
    { label: "Diagnostics", value: "1 warning", tone: "warn" }
  ],
  sections: [
    {
      title: "Executive Summary",
      body: "The portfolio specification computes weighted return and volatility from declared asset inputs. The total weight validation passes against the 1.0 threshold."
    },
    {
      title: "Cash Flow Notes",
      body: "Projected quarterly flows are staged for CSV and Excel export. Report values are currently generated by mock services until compiler integration is attached."
    },
    {
      title: "Sensitivity Analysis",
      body: "The sensitivity chart uses the workspace default confidence interval because the specification did not override the global range setting."
    }
  ]
};


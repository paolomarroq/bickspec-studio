import type { FinancialMetric, FinancialReportModel } from "../contracts/reports";
import { extractPlainProgramOutput } from "./runtimeOutput";

interface ExtractFinancialReportInput {
  sourceText?: string;
  programOutput?: string;
  interactiveComplete?: boolean;
}

const emptyModel = (): FinancialReportModel => ({
  detected: false,
  cashFlows: [],
  rates: [],
  npv: {},
  decisions: [],
  builtIns: [],
  metrics: [],
  diagnostics: []
});

const aliases: Array<{ pattern: RegExp; key: string; label: string }> = [
  { pattern: /\b(?:INITIAL\s+INVESTMENT|INVESTMENT|INVERSION\s+INICIAL|INVERSION)\b/i, key: "INVESTMENT", label: "Investment" },
  { pattern: /\b(?:NPV\s+BASE|NPV_BASE|VAN\s+BASE|VAN_BASE|NPV)\b/i, key: "NPV_BASE", label: "NPV Base" },
  { pattern: /\b(?:NPV\s+LOW\s+RATE|NPV_LOW_RATE|NPV\s+LOW|NPV_LOW)\b/i, key: "NPV_LOW", label: "NPV Low Rate" },
  { pattern: /\b(?:NPV\s+HIGH\s+RATE|NPV_HIGH_RATE|NPV\s+HIGH|NPV_HIGH)\b/i, key: "NPV_HIGH", label: "NPV High Rate" },
  { pattern: /\b(?:PAYBACK\s+YEARS|PAYBACK_YEARS|PAYBACK\s+PERIOD|PAYBACK_PERIOD|PERIODO\s+RECUPERACION|PAYBACK)\b/i, key: "PAYBACK_YEARS", label: "Payback Years" },
  { pattern: /\b(?:TOTAL\s+RETURN|TOTAL_RETURN)\b/i, key: "TOTAL_RETURN", label: "Total Return" },
  { pattern: /\bROI\b/i, key: "ROI", label: "ROI" },
  { pattern: /\b(?:PROFITABILITY\s+INDEX|PROFITABILITY_INDEX|\bPI\b)\b/i, key: "PROFITABILITY_INDEX", label: "Profitability Index" },
  { pattern: /\b(?:RATE\s+LOW|RATE_LOW|TASA\s+BAJA|TASA_BAJA)\b/i, key: "RATE_LOW", label: "Low Rate" },
  { pattern: /\b(?:RATE\s+HIGH|RATE_HIGH|TASA\s+ALTA|TASA_ALTA)\b/i, key: "RATE_HIGH", label: "High Rate" },
  { pattern: /\b(?:RATE|TASA)\b/i, key: "RATE", label: "Base Rate" }
];

export function extractFinancialReport({
  sourceText = "",
  programOutput = "",
  interactiveComplete = true
}: ExtractFinancialReportInput): FinancialReportModel {
  const model = emptyModel();
  if (!interactiveComplete) {
    model.diagnostics.push("Complete the interactive session to generate financial charts.");
    return model;
  }

  const sourceMetrics = parseSourceMetrics(sourceText);
  const outputMetrics = parseOutputMetrics(programOutput);
  const metrics = mergeMetrics(sourceMetrics, outputMetrics);
  model.metrics = metrics;
  model.decisions = parseDecisions(programOutput);
  model.builtIns = detectBuiltIns(sourceText, metrics);

  const cashFlowMetrics = metrics
    .filter((metric) => /^CF\d+$/i.test(metric.key))
    .sort((left, right) => Number(left.key.slice(2)) - Number(right.key.slice(2)));
  if (!cashFlowMetrics.some((metric) => metric.key === "CF0")) {
    const investment = findMetric(metrics, "INVESTMENT")?.value;
    if (investment !== undefined && /CF0\s*:=\s*0\s*-\s*(?:INVESTMENT|INITIAL_INVESTMENT|INVERSION|INVERSION_INICIAL)\b/i.test(sourceText)) {
      cashFlowMetrics.unshift({ key: "CF0", label: "Cash Flow Year 0", value: -investment });
    }
  }

  let cumulative = 0;
  model.cashFlows = cashFlowMetrics.map((metric) => {
    cumulative += metric.value;
    return {
      period: Number(metric.key.slice(2)),
      label: metric.label,
      value: metric.value,
      cumulative
    };
  });
  model.rates = metrics.filter((metric) => ["RATE", "RATE_LOW", "RATE_HIGH", "TASA", "TASA_BAJA", "TASA_ALTA"].includes(metric.key));
  model.npv = {
    base: findMetric(metrics, "NPV_BASE")?.value ?? findMetric(metrics, "VAN_BASE")?.value,
    low: findMetric(metrics, "NPV_LOW")?.value,
    high: findMetric(metrics, "NPV_HIGH")?.value
  };
  model.investment = findMetric(metrics, "INVESTMENT")?.value;
  model.payback = findMetric(metrics, "PAYBACK_YEARS")?.value ?? findMetric(metrics, "PAYBACK")?.value;
  model.roi = findMetric(metrics, "ROI")?.value;
  model.totalReturn = findMetric(metrics, "TOTAL_RETURN")?.value;
  model.profitabilityIndex = findMetric(metrics, "PROFITABILITY_INDEX")?.value;

  if (model.cashFlows.length === 0) model.diagnostics.push("Cash flow variables were not detected.");
  if (model.npv.base !== undefined && (model.npv.low === undefined || model.npv.high === undefined)) {
    model.diagnostics.push("NPV values were detected but no complete rate sensitivity values were found.");
  }
  if (model.builtIns.includes("PAYBACK") && model.payback === undefined) {
    model.diagnostics.push("PAYBACK was detected, but no payback result value was found in program output.");
  }

  model.detected = Boolean(
    model.cashFlows.length ||
    model.rates.length ||
    model.npv.base !== undefined ||
    model.npv.low !== undefined ||
    model.npv.high !== undefined ||
    model.payback !== undefined ||
    model.roi !== undefined ||
    model.totalReturn !== undefined ||
    model.profitabilityIndex !== undefined ||
    model.builtIns.length
  );
  if (!model.detected) {
    model.diagnostics = ["No financial chart data detected. Use CF0..CFN, NPV(...), PAYBACK(...), ROI, or related variables to enable financial charts."];
  }
  return model;
}

function parseOutputMetrics(programOutput: string): FinancialMetric[] {
  const lines = extractPlainProgramOutput(programOutput);
  const metrics: FinancialMetric[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const label = normalizeLabel(lines[index]);
    const value = parseNumber(lines[index + 1]);
    if (!label || value === undefined) continue;
    const key = keyFromLabel(label);
    if (key) metrics.push({ key, label: displayLabel(label), value });
  }
  return metrics;
}

function parseSourceMetrics(sourceText: string): FinancialMetric[] {
  const metrics: FinancialMetric[] = [];
  const assignmentPattern = /^\s*([A-Z_][A-Z0-9_]*(?:\s*,\s*[A-Z_][A-Z0-9_]*)*)\s*:=\s*(.+)$/gim;
  for (const match of sourceText.matchAll(assignmentPattern)) {
    const keys = match[1].split(",").map((key) => key.trim().toUpperCase());
    const values = match[2].split(",").map((value) => parseLiteralNumber(value));
    keys.forEach((key, index) => {
      const value = values[index];
      if (value !== undefined && isKnownFinancialKey(key)) metrics.push({ key, label: labelFromKey(key), value });
    });
  }
  return metrics;
}

function mergeMetrics(sourceMetrics: FinancialMetric[], outputMetrics: FinancialMetric[]): FinancialMetric[] {
  const byKey = new Map<string, FinancialMetric>();
  sourceMetrics.forEach((metric) => byKey.set(metric.key, metric));
  outputMetrics.forEach((metric) => byKey.set(metric.key, metric));
  return Array.from(byKey.values());
}

function parseDecisions(programOutput: string): string[] {
  return extractPlainProgramOutput(programOutput).filter((line) => /\bdecision\b/i.test(line));
}

function detectBuiltIns(sourceText: string, metrics: FinancialMetric[]): Array<"NPV" | "PAYBACK"> {
  const builtIns = new Set<"NPV" | "PAYBACK">();
  if (/\bNPV\s*\(/i.test(sourceText) || metrics.some((metric) => metric.key.startsWith("NPV") || metric.key.startsWith("VAN"))) builtIns.add("NPV");
  if (/\bPAYBACK\s*\(/i.test(sourceText) || metrics.some((metric) => metric.key.startsWith("PAYBACK"))) builtIns.add("PAYBACK");
  return Array.from(builtIns);
}

function keyFromLabel(label: string): string | undefined {
  const cashFlow = label.match(/\b(?:CF|CASH\s*FLOW\s*(?:YEAR)?)\s*([0-9]+)\b/i);
  if (cashFlow) return `CF${cashFlow[1]}`;
  const alias = aliases.find((entry) => entry.pattern.test(label));
  return alias?.key;
}

function labelFromKey(key: string): string {
  if (/^CF\d+$/i.test(key)) return `Cash Flow Year ${key.slice(2)}`;
  return aliases.find((entry) => entry.key === key)?.label ?? key.replace(/_/g, " ");
}

function isKnownFinancialKey(key: string): boolean {
  return /^CF\d+$/i.test(key) || aliases.some((entry) => entry.key === key);
}

function findMetric(metrics: FinancialMetric[], key: string): FinancialMetric | undefined {
  return metrics.find((metric) => metric.key === key);
}

function parseNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const match = raw.trim().match(/[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|[+-]?\.\d+/);
  if (!match) return undefined;
  const value = Number(match[0].replace(/,/g, ""));
  return Number.isFinite(value) ? value : undefined;
}

function parseLiteralNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(trimmed)) return undefined;
  return parseNumber(trimmed);
}

function normalizeLabel(line: string): string {
  return line.replace(/:$/, "").trim();
}

function displayLabel(label: string): string {
  return label.replace(/_/g, " ").replace(/\s+/g, " ");
}

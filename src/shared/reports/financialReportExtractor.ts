import type { FinancialCurrency, FinancialMetric, FinancialMetricKind, FinancialReportModel } from "../contracts/reports";
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
  currencies: [],
  diagnostics: []
});

const supportedCurrencies: FinancialCurrency[] = ["USD", "GTQ", "EUR"];

const aliases: Array<{ pattern: RegExp; baseKey: string; label: string; kind: FinancialMetricKind }> = [
  { pattern: /\b(?:INITIAL\s+INVESTMENT|INVESTMENT|INVERSION\s+INICIAL|INVERSION)\b/i, baseKey: "INVESTMENT", label: "Investment", kind: "money" },
  { pattern: /\b(?:NPV\s+LOW\s+RATE|NPV_LOW_RATE|NPV\s+LOW|NPV_LOW)\b/i, baseKey: "NPV_LOW", label: "NPV Low Rate", kind: "money" },
  { pattern: /\b(?:NPV\s+HIGH\s+RATE|NPV_HIGH_RATE|NPV\s+HIGH|NPV_HIGH)\b/i, baseKey: "NPV_HIGH", label: "NPV High Rate", kind: "money" },
  { pattern: /\b(?:NPV\s+BASE|NPV_BASE|VAN\s+BASE|VAN_BASE|NPV)\b/i, baseKey: "NPV_BASE", label: "NPV Base", kind: "money" },
  { pattern: /\b(?:PAYBACK\s+YEARS|PAYBACK_YEARS|PAYBACK\s+PERIOD|PAYBACK_PERIOD|PERIODO\s+RECUPERACION|PAYBACK)\b/i, baseKey: "PAYBACK_YEARS", label: "Payback Years", kind: "years" },
  { pattern: /\b(?:TOTAL\s+RETURN|TOTAL_RETURN)\b/i, baseKey: "TOTAL_RETURN", label: "Total Return", kind: "money" },
  { pattern: /\bROI\b/i, baseKey: "ROI", label: "ROI", kind: "ratio" },
  { pattern: /\b(?:PROFITABILITY\s+INDEX|PROFITABILITY_INDEX|\bPI\b)\b/i, baseKey: "PROFITABILITY_INDEX", label: "Profitability Index", kind: "ratio" },
  { pattern: /\b(?:RATE\s+LOW|RATE_LOW|TASA\s+BAJA|TASA_BAJA)\b/i, baseKey: "RATE_LOW", label: "Low Rate", kind: "rate" },
  { pattern: /\b(?:RATE\s+HIGH|RATE_HIGH|TASA\s+ALTA|TASA_ALTA)\b/i, baseKey: "RATE_HIGH", label: "High Rate", kind: "rate" },
  { pattern: /\b(?:RATE|TASA)\b/i, baseKey: "RATE", label: "Base Rate", kind: "rate" }
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

  const sourceHints = parseSourceHints(sourceText);
  const sourceMetrics = parseSourceMetrics(sourceText, sourceHints);
  const outputMetrics = parseOutputMetrics(programOutput, sourceHints);
  const metrics = mergeMetrics(sourceMetrics, outputMetrics);
  model.metrics = metrics;
  model.currencies = Array.from(new Set(metrics.map((metric) => metric.currency).filter(Boolean))) as FinancialCurrency[];
  model.decisions = parseDecisions(programOutput);
  model.builtIns = detectBuiltIns(sourceText, metrics);

  const cashFlowMetrics = metrics
    .filter((metric) => baseKey(metric.key).match(/^CF\d+$/i))
    .sort((left, right) => Number(baseKey(left.key).slice(2)) - Number(baseKey(right.key).slice(2)) || String(left.currency ?? "").localeCompare(String(right.currency ?? "")));
  if (!cashFlowMetrics.some((metric) => baseKey(metric.key) === "CF0")) {
    const investment = findMetric(metrics, "INVESTMENT")?.value;
    if (investment !== undefined && /CF0\s*:=\s*0\s*-\s*(?:INVESTMENT|INITIAL_INVESTMENT|INVERSION|INVERSION_INICIAL)\b/i.test(sourceText)) {
      const investmentMetric = findMetric(metrics, "INVESTMENT");
      cashFlowMetrics.unshift({ key: keyWithCurrency("CF0", investmentMetric?.currency), label: labelWithCurrency("Cash Flow Year 0", investmentMetric?.currency), value: -investment, currency: investmentMetric?.currency, kind: "money" });
    }
  }

  const cumulativeByCurrency = new Map<string, number>();
  model.cashFlows = cashFlowMetrics.map((metric) => {
    const currencyKey = metric.currency ?? "NUMBER";
    const cumulative = (cumulativeByCurrency.get(currencyKey) ?? 0) + metric.value;
    cumulativeByCurrency.set(currencyKey, cumulative);
    return {
      period: Number(baseKey(metric.key).slice(2)),
      label: metric.label,
      value: metric.value,
      cumulative,
      currency: metric.currency
    };
  });
  model.rates = metrics.filter((metric) => ["RATE", "RATE_LOW", "RATE_HIGH", "TASA", "TASA_BAJA", "TASA_ALTA"].includes(baseKey(metric.key)));
  model.npv = {
    base: findMetric(metrics, "NPV_BASE")?.value ?? findMetric(metrics, "VAN_BASE")?.value ?? findFirstMetric(metrics, "NPV_BASE")?.value,
    low: findMetric(metrics, "NPV_LOW")?.value ?? findFirstMetric(metrics, "NPV_LOW")?.value,
    high: findMetric(metrics, "NPV_HIGH")?.value ?? findFirstMetric(metrics, "NPV_HIGH")?.value
  };
  model.investment = findMetric(metrics, "INVESTMENT")?.value ?? findFirstMetric(metrics, "INVESTMENT")?.value;
  model.payback = findMetric(metrics, "PAYBACK_YEARS")?.value ?? findMetric(metrics, "PAYBACK")?.value ?? findFirstMetric(metrics, "PAYBACK_YEARS")?.value;
  model.roi = findMetric(metrics, "ROI")?.value ?? findFirstMetric(metrics, "ROI")?.value;
  model.totalReturn = findMetric(metrics, "TOTAL_RETURN")?.value ?? findFirstMetric(metrics, "TOTAL_RETURN")?.value;
  model.profitabilityIndex = findMetric(metrics, "PROFITABILITY_INDEX")?.value ?? findFirstMetric(metrics, "PROFITABILITY_INDEX")?.value;

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

interface SourceHints {
  variableCurrencies: Map<string, FinancialCurrency>;
  displayVariables: string[];
  declaredCurrencies: Set<FinancialCurrency>;
}

function parseOutputMetrics(programOutput: string, sourceHints: SourceHints): FinancialMetric[] {
  const lines = extractPlainProgramOutput(programOutput);
  const metrics: FinancialMetric[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const label = normalizeLabel(lines[index]);
    const value = parseNumber(lines[index + 1]);
    if (!label || value === undefined) continue;
    const displayedVariable = sourceHints.displayVariables[metrics.length];
    const currency = inferCurrency(label) ?? (displayedVariable ? sourceHints.variableCurrencies.get(displayedVariable) : undefined);
    const metric = metricFromText(label, value, currency);
    if (metric) metrics.push(metric);
  }
  return metrics;
}

function parseSourceMetrics(sourceText: string, sourceHints: SourceHints): FinancialMetric[] {
  const metrics: FinancialMetric[] = [];
  const assignmentPattern = /^\s*([A-Z_][A-Z0-9_]*(?:\s*,\s*[A-Z_][A-Z0-9_]*)*)\s*:=\s*(.+)$/gim;
  for (const match of sourceText.matchAll(assignmentPattern)) {
    const keys = match[1].split(",").map((key) => key.trim().toUpperCase());
    const values = match[2].split(",").map((value) => parseLiteralNumber(value));
    keys.forEach((key, index) => {
      const value = values[index];
      if (value !== undefined && isKnownFinancialKey(key)) {
        const currency = sourceHints.variableCurrencies.get(key) ?? inferCurrency(key);
        metrics.push(metricFromKey(key, value, currency));
      }
    });
  }
  return metrics;
}

function mergeMetrics(sourceMetrics: FinancialMetric[], outputMetrics: FinancialMetric[]): FinancialMetric[] {
  const byKey = new Map<string, FinancialMetric>();
  const outputBaseKeys = new Set(outputMetrics.map((metric) => baseKey(metric.key)));
  sourceMetrics
    .filter((metric) => metric.kind === "rate" || !outputBaseKeys.has(baseKey(metric.key)))
    .forEach((metric) => byKey.set(metric.key, metric));
  outputMetrics.forEach((metric) => byKey.set(metric.key, metric));
  return Array.from(byKey.values());
}

function parseDecisions(programOutput: string): string[] {
  return extractPlainProgramOutput(programOutput).filter((line) => /\bdecision\b/i.test(line));
}

function detectBuiltIns(sourceText: string, metrics: FinancialMetric[]): Array<"NPV" | "PAYBACK"> {
  const builtIns = new Set<"NPV" | "PAYBACK">();
  if (/\bNPV\s*\(/i.test(sourceText) || metrics.some((metric) => baseKey(metric.key).startsWith("NPV") || baseKey(metric.key).startsWith("VAN"))) builtIns.add("NPV");
  if (/\bPAYBACK\s*\(/i.test(sourceText) || metrics.some((metric) => baseKey(metric.key).startsWith("PAYBACK"))) builtIns.add("PAYBACK");
  return Array.from(builtIns);
}

function parseSourceHints(sourceText: string): SourceHints {
  const variableCurrencies = new Map<string, FinancialCurrency>();
  const declaredCurrencies = new Set<FinancialCurrency>(["USD"]);
  for (const match of sourceText.matchAll(/\bFX\s+(USD|GTQ|EUR)\s*:=/gi)) {
    declaredCurrencies.add(match[1].toUpperCase() as FinancialCurrency);
  }

  const assignmentPattern = /^\s*([A-Z_][A-Z0-9_]*(?:\s*,\s*[A-Z_][A-Z0-9_]*)*)\s*:=\s*(.+)$/gim;
  for (const match of sourceText.matchAll(assignmentPattern)) {
    const keys = match[1].split(",").map((key) => key.trim().toUpperCase());
    const expressions = match[2].split(",");
    keys.forEach((key, index) => {
      const expression = expressions[index] ?? match[2];
      const currency = inferCurrency(key) ?? inferConversionCurrency(expression);
      if (currency) variableCurrencies.set(key, currency);
    });
  }

  const displayVariables = Array.from(sourceText.matchAll(/^\s*DISPLAY\s+([A-Z_][A-Z0-9_]*)\s*$/gim)).map((match) => match[1].toUpperCase());
  return { variableCurrencies, displayVariables, declaredCurrencies };
}

function metricFromText(text: string, value: number, forcedCurrency?: FinancialCurrency): FinancialMetric | undefined {
  const cashFlow = text.match(/\b(?:CF|CASH\s*FLOW\s*(?:YEAR)?)\s*([0-9]+)\b/i);
  const currency = forcedCurrency ?? inferCurrency(text);
  if (cashFlow) {
    return {
      key: keyWithCurrency(`CF${cashFlow[1]}`, currency),
      label: labelWithCurrency(`Cash Flow Year ${cashFlow[1]}`, currency),
      value,
      currency,
      kind: "money"
    };
  }

  const alias = aliases.find((entry) => entry.pattern.test(text));
  if (!alias) return undefined;
  return {
    key: keyWithCurrency(alias.baseKey, currency),
    label: labelWithCurrency(alias.label, currency),
    value,
    currency,
    kind: alias.kind
  };
}

function metricFromKey(key: string, value: number, forcedCurrency?: FinancialCurrency): FinancialMetric {
  const normalizedKey = key.toUpperCase();
  const currency = forcedCurrency ?? inferCurrency(normalizedKey);
  const keyWithoutCurrency = stripCurrencyToken(normalizedKey);
  const alias = aliases.find((entry) => entry.baseKey === keyWithoutCurrency || entry.pattern.test(keyWithoutCurrency));
  const kind = alias?.kind ?? (/^CF\d+$/i.test(keyWithoutCurrency) ? "money" : "number");
  const label = /^CF\d+$/i.test(keyWithoutCurrency) ? `Cash Flow Year ${keyWithoutCurrency.slice(2)}` : alias?.label ?? keyWithoutCurrency.replace(/_/g, " ");
  return {
    key: keyWithCurrency(keyWithoutCurrency, currency),
    label: labelWithCurrency(label, currency),
    value,
    currency,
    kind
  };
}

function isKnownFinancialKey(key: string): boolean {
  const stripped = stripCurrencyToken(key.toUpperCase());
  return /^CF\d+$/i.test(stripped) || aliases.some((entry) => entry.baseKey === stripped || entry.pattern.test(stripped));
}

function findMetric(metrics: FinancialMetric[], key: string): FinancialMetric | undefined {
  return metrics.find((metric) => metric.key === key);
}

function findFirstMetric(metrics: FinancialMetric[], key: string): FinancialMetric | undefined {
  return metrics.find((metric) => baseKey(metric.key) === key);
}

function inferCurrency(raw: string): FinancialCurrency | undefined {
  const upper = raw.toUpperCase();
  return supportedCurrencies.find((currency) => new RegExp(`(?:^|[^A-Z0-9])${currency}(?:$|[^A-Z0-9])`).test(upper));
}

function inferConversionCurrency(raw: string): FinancialCurrency | undefined {
  const match = raw.match(/\bto\s+(USD|GTQ|EUR)\b/i);
  return match?.[1].toUpperCase() as FinancialCurrency | undefined;
}

function stripCurrencyToken(key: string): string {
  return key
    .replace(/_(USD|GTQ|EUR)(?=_|$)/g, "")
    .replace(/^(USD|GTQ|EUR)_/g, "")
    .replace(/_(BASE|LOW|HIGH)_RATE$/g, "_$1")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function baseKey(key: string): string {
  return stripCurrencyToken(key.toUpperCase());
}

function keyWithCurrency(key: string, currency?: FinancialCurrency): string {
  if (!currency || ["RATE", "RATE_LOW", "RATE_HIGH", "PROFITABILITY_INDEX"].includes(key)) return key;
  const parts = key.split("_");
  if (parts[0] === "NPV" && parts.length > 1) return ["NPV", currency, ...parts.slice(1)].join("_");
  return `${key}_${currency}`;
}

function labelWithCurrency(label: string, currency?: FinancialCurrency): string {
  if (!currency || new RegExp(`\\b${currency}\\b`, "i").test(label)) return label;
  if (/rate|profitability/i.test(label)) return label;
  return `${label} ${currency}`;
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

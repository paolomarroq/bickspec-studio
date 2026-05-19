import type { FinancialCurrency, FinancialMetric, FinancialMetricKind } from "../contracts/reports";

const currencySymbols: Record<FinancialCurrency, string> = {
  USD: "$",
  GTQ: "Q",
  EUR: "€"
};

export function formatFinancialValue(value: number, currency?: FinancialCurrency, kind: FinancialMetricKind = "number"): string {
  if (kind === "rate") return `${(value * 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
  if (kind === "ratio") return `${(value * 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
  if (kind === "years") return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} years`;
  if (kind === "money" && currency) {
    return `${currencySymbols[currency]}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function formatMetricValue(metric: FinancialMetric): string {
  return formatFinancialValue(metric.value, metric.currency, metric.kind);
}

export function currencyLabel(currency?: FinancialCurrency): string {
  return currency ? `${currencySymbols[currency]} / ${currency}` : "Number";
}

const scientificNotationPattern = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)[eE][+-]?\d+$/;
const plainNumericPattern = /^[+-]?\d+(?:\.\d+)?$/;

export function formatRuntimeOutputLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return line;

  if (scientificNotationPattern.test(trimmed)) {
    return preserveOuterWhitespace(line, formatMoneyLikeNumber(Number(trimmed)));
  }

  if (plainNumericPattern.test(trimmed)) {
    const value = Number(trimmed);
    if (Number.isFinite(value) && Math.abs(value) >= 1000 && Math.abs(value) >= 1) {
      return preserveOuterWhitespace(line, formatMoneyLikeNumber(value));
    }
  }

  return line;
}

export function formatRuntimeOutputText(text: string): string {
  return text
    .split(/\r?\n/)
    .map(formatRuntimeOutputLine)
    .join("\n");
}

function formatMoneyLikeNumber(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function preserveOuterWhitespace(original: string, replacement: string): string {
  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";
  return `${leading}${replacement}${trailing}`;
}

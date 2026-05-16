import type { InteractiveTranscriptEntry } from "../contracts/backend";

const scientificNotationPattern = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)[eE][+-]?\d+$/;
const plainNumericPattern = /^[+-]?\d+(?:\.\d+)?$/;
const borderPattern = /^\+-+\+$/;
const titleBorderPattern = /^\+-+\sPROGRAM OUTPUT\s-+\+$/;

export function extractPlainProgramOutput(output: string): string[] {
  return output
    .split(/\r?\n/)
    .filter((line) => !borderPattern.test(line.trim()) && !titleBorderPattern.test(line.trim()))
    .map((line) => line.match(/^\|\s?(.*?)\s?\|$/)?.[1] ?? line)
    .map(formatRuntimeOutputLine)
    .filter((line) => line.length > 0);
}

export function cleanInteractiveEntries(entries: InteractiveTranscriptEntry[]): InteractiveTranscriptEntry[] {
  return entries.flatMap((entry) =>
    entry.text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line, index) => ({
        ...entry,
        id: `${entry.id}-${index}`,
        text: entry.speaker === "program" ? formatRuntimeOutputLine(line) : line
      }))
  );
}

export function formatRuntimeOutputLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return line;
  if (scientificNotationPattern.test(trimmed)) return formatNumber(Number(trimmed));
  if (plainNumericPattern.test(trimmed)) {
    const value = Number(trimmed);
    if (Number.isFinite(value) && Math.abs(value) >= 1000) return formatNumber(value);
  }
  return trimmed;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

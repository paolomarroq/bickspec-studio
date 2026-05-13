import type { CompilerOutputTag, ParsedCompilerOutput, ParsedCompilerOutputLine } from "@shared/contracts/backend";

const knownTags = new Set<CompilerOutputTag>([
  "STATUS",
  "ERROR",
  "SYMBOLS",
  "TREE",
  "JAVA",
  "BUILD",
  "EXECUTION",
  "SUCCESS",
  "SUMMARY"
]);

export class CompilerOutputParser {
  parse(rawOutput: string): ParsedCompilerOutput {
    const lines = rawOutput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => this.parseLine(line));

    return {
      lines,
      diagnostics: lines.filter((line) => line.tag === "ERROR"),
      artifacts: lines.filter((line) => ["SYMBOLS", "TREE", "JAVA", "BUILD", "SUMMARY"].includes(line.tag)),
      statuses: lines.filter((line) => ["STATUS", "EXECUTION", "SUCCESS"].includes(line.tag)),
      success: lines.some((line) => line.tag === "SUCCESS") || (lines.length > 0 && !lines.some((line) => line.tag === "ERROR"))
    };
  }

  private parseLine(raw: string): ParsedCompilerOutputLine {
    const match = raw.match(/^\[([A-Z]+)]\s*(.*)$/);
    const tag = match && knownTags.has(match[1] as CompilerOutputTag) ? (match[1] as CompilerOutputTag) : "UNKNOWN";
    const message = match ? match[2] : raw;

    return {
      tag,
      message,
      raw,
      path: this.extractPath(tag, message)
    };
  }

  private extractPath(tag: CompilerOutputTag, message: string): string | undefined {
    if (!["SYMBOLS", "TREE", "JAVA", "BUILD", "SUMMARY"].includes(tag)) return undefined;
    return message || undefined;
  }
}


import type {
  CompilerDiagnostic,
  CompilerDiagnosticCategory,
  CompilerDiagnosticSeverity,
  CompilerStage,
  ParsedCompilerOutput
} from "@shared/contracts/backend";

export class CompilerDiagnosticsParser {
  parse(parsedOutput: ParsedCompilerOutput, stderr: string): CompilerDiagnostic[] {
    const taggedDiagnostics = parsedOutput.diagnostics.map((line, index) =>
      this.fromRaw(line.raw, index, "error", line.message)
    );
    const stderrDiagnostics = stderr
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => /error|exception|failed|line \d+|mismatched|extraneous/i.test(line))
      .map((line, index) => this.fromRaw(line, taggedDiagnostics.length + index, "error", line));

    return [...taggedDiagnostics, ...stderrDiagnostics];
  }

  private fromRaw(raw: string, index: number, severity: CompilerDiagnosticSeverity, message: string): CompilerDiagnostic {
    const location = this.parseLocation(raw);
    const category = this.getCategory(raw);
    const stage = this.getStage(raw, category);

    return {
      code: `BKS-${category}-${String(index + 1).padStart(3, "0")}`,
      category,
      severity,
      message: this.stripLocation(message),
      filePath: location.filePath,
      line: location.line,
      column: location.column,
      stage,
      blocking: severity === "error",
      raw
    };
  }

  private parseLocation(raw: string): { filePath?: string; line?: number; column?: number } {
    const fileLineColumn = raw.match(/(.+?):(\d+):(\d+)/);
    if (fileLineColumn) {
      return {
        filePath: fileLineColumn[1],
        line: Number(fileLineColumn[2]),
        column: Number(fileLineColumn[3])
      };
    }

    const lineColumn = raw.match(/line\s+(\d+):(\d+)/i);
    if (lineColumn) {
      return {
        line: Number(lineColumn[1]),
        column: Number(lineColumn[2])
      };
    }

    return {};
  }

  private getCategory(raw: string): CompilerDiagnosticCategory {
    if (/lexer|token|lex/i.test(raw)) return "LEX";
    if (/parser|parse|syntax|mismatched|extraneous|line\s+\d+:\d+/i.test(raw)) return "SYN";
    if (/semantic|symbol|type|undeclared|duplicate/i.test(raw)) return "SEM";
    if (/java|generation|transpile/i.test(raw)) return "GEN";
    if (/build|javac|class/i.test(raw)) return "BUILD";
    if (/execution|runtime|exception/i.test(raw)) return "EXECUTION";
    return "OTHER";
  }

  private getStage(raw: string, category: CompilerDiagnosticCategory): CompilerStage {
    if (category === "LEX" || category === "SYN") return "parse";
    if (category === "SEM") return "semantic";
    if (category === "GEN") return "java";
    if (category === "BUILD") return "build";
    if (category === "EXECUTION") return "execution";
    if (/java/i.test(raw)) return "java";
    return "parse";
  }

  private stripLocation(message: string): string {
    return message.replace(/^(.+?):\d+:\d+:\s*/, "").replace(/^line\s+\d+:\d+\s*/, "");
  }
}


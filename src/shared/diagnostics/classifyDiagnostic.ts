import type { DiagnosticType } from "./diagnosticTypes";

export function classifyDiagnostic(raw: string, explicitCode?: string): DiagnosticType {
  const code = explicitCode ?? extractDiagnosticCode(raw);
  if (/^LEX/i.test(code ?? "")) return "LEX";
  if (/^SYN/i.test(code ?? "")) return "SYN";
  if (/^SEM/i.test(code ?? "")) return "SEM";
  if (/^GEN/i.test(code ?? "")) return "GEN";
  if (/^BUILD/i.test(code ?? "")) return "BUILD";
  if (/^EXEC/i.test(code ?? "")) return "EXECUTION";
  if (/^FS/i.test(code ?? "")) return "FS";
  if (/^LINK/i.test(code ?? "")) return "LINK";

  if (/token recognition error/i.test(raw)) return "LEX";
  if (/mismatched input|extraneous input|missing\b|no viable alternative|parser|parse failed|syntax/i.test(raw)) return "SYN";
  if (/semantic|used before declaration|undeclared|type mismatch|invalid currency|invalid operation/i.test(raw)) return "SEM";
  if (/java generation|generation|transpil/i.test(raw)) return "GEN";
  if (/javac|build failure|generated java compilation failed/i.test(raw)) return "BUILD";
  if (/runtime exception|execution|division by zero/i.test(raw)) return "EXECUTION";
  if (/file read|file write|filesystem|file system|permission|enoent|eacces|path does not exist/i.test(raw)) return "FS";
  if (/linked repo|linked bickspec|compiler jar|artifact path|linked compiler/i.test(raw)) return "LINK";
  return "OTHER";
}

export function extractDiagnosticCode(raw: string): string | undefined {
  return raw.match(/\b(LEX|SYN|SEM|GEN|BUILD|EXEC|FS|LINK)\d+\b/i)?.[0]?.toUpperCase();
}

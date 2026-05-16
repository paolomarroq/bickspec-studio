import type { CompilerDiagnosticCategory } from "../contracts/backend";

export type DiagnosticType = CompilerDiagnosticCategory;

export const diagnosticLabels: Record<DiagnosticType, string> = {
  LEX: "Lexical",
  SYN: "Syntax",
  SEM: "Semantic",
  GEN: "Generation",
  BUILD: "Build",
  EXECUTION: "Runtime",
  FS: "File System",
  LINK: "Compiler Link",
  OTHER: "Error"
};

import type { DiagnosticType } from "./diagnosticTypes";

export const diagnosticSuggestions: Partial<Record<DiagnosticType, string>> = {
  LEX: "Remove unsupported characters or replace them with valid BickSpec tokens.",
  SYN: "Check braces, parentheses, string quotes, assignment operator :=, and statement structure.",
  SEM: "Check that variables are declared before use and that operations use compatible types.",
  GEN: "Review unsupported constructs that could not be translated to Java.",
  BUILD: "Check generated Java compilation errors and Java installation.",
  EXECUTION: "Check runtime values, input values, division by zero, or invalid execution state.",
  FS: "Verify file permissions, workspace path, and output folder access.",
  LINK: "Verify the linked bickspec-lang repository or compiler JAR path."
};

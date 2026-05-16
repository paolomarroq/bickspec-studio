import type * as Monaco from "monaco-editor";
import { BICKSPEC_LANGUAGE_ID } from "./bickspecLanguage";

export function registerBickSpecCompletions(monaco: typeof Monaco) {
  return monaco.languages.registerCompletionItemProvider(BICKSPEC_LANGUAGE_ID, {
    triggerCharacters: [" ", ":", "(", '"'],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };
      const textBeforeCursor = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });
      const currentLine = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
      const fileIsEmpty = model.getValue().trim().length === 0;
      const afterDisplay = /\bDISPLAY\s+[A-Za-z_]*$/i.test(currentLine);
      const insideProject = /\bPROJECT\b[\s\S]*\{/.test(textBeforeCursor) && !/\}\s*$/.test(textBeforeCursor);

      const suggestions: Monaco.languages.CompletionItem[] = [];

      if (fileIsEmpty || /^PRO/i.test(word.word)) {
        suggestions.push({
          label: "PROJECT",
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: "Project block",
          documentation: "Start a valid BickSpec project.",
          insertText: 'PROJECT "${1:New Financial Specification}" {\n  ${2:DISPLAY "Ready"}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range
        });
      }

      if (afterDisplay) {
        suggestions.push(
          {
            label: 'DISPLAY "text"',
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: "Display text",
            documentation: "Print a string literal.",
            insertText: '"${1:Ready}"',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          },
          {
            label: "DISPLAY identifier",
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: "Display value",
            documentation: "Print a variable or expression.",
            insertText: "${1:value}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          }
        );
      }

      if (insideProject || !fileIsEmpty) {
        suggestions.push(
          snippet(monaco, "DISPLAY", "Display statement", 'DISPLAY "${1:Ready}"', range),
          snippet(monaco, "READ", "Read statement", "READ ${1:value}", range),
          snippet(monaco, "assignment", "Variable assignment", "${1:TOTAL} := ${2:0}", range),
          snippet(monaco, "IF", "Conditional block", "IF ${1:A > B} THEN\n  ${2:DISPLAY A}\nELSE\n  ${3:DISPLAY B}\nEND", range),
          snippet(monaco, "WHILE", "Loop block", "WHILE ${1:condition} DO\n  ${2:DISPLAY value}\nEND", range),
          snippet(monaco, "FUNCTION", "Function declaration", "FUNCTION ${1:name}(${2:arg}) = ${3:arg}", range),
          snippet(monaco, "NPV", "NPV call", "NPV(${1:cashflows})", range),
          snippet(monaco, "PAYBACK", "PAYBACK call", "PAYBACK(${1:cashflows})", range),
          snippet(monaco, "IMPORT", "Import declaration", "IMPORT ${1:module}", range)
        );
      }

      suggestions.push(
        keyword(monaco, "PROJECT", "Project block keyword", range),
        keyword(monaco, "DISPLAY", "Display expression", range),
        keyword(monaco, "READ", "Read into a variable", range),
        keyword(monaco, "IF", "Conditional block", range),
        keyword(monaco, "ELSE", "Conditional branch", range),
        keyword(monaco, "WHILE", "Loop block", range),
        keyword(monaco, "FUNCTION", "Function declaration", range),
        keyword(monaco, "NPV", "Financial function", range),
        keyword(monaco, "PAYBACK", "Financial function", range),
        keyword(monaco, "USD", "Currency token", range),
        keyword(monaco, "GTQ", "Currency token", range),
        keyword(monaco, "EUR", "Currency token", range)
      );

      return { suggestions };
    }
  });
}

function snippet(
  monaco: typeof Monaco,
  label: string,
  detail: string,
  insertText: string,
  range: Monaco.IRange
): Monaco.languages.CompletionItem {
  return {
    label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    detail,
    insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range
  };
}

function keyword(monaco: typeof Monaco, label: string, detail: string, range: Monaco.IRange): Monaco.languages.CompletionItem {
  return {
    label,
    kind: monaco.languages.CompletionItemKind.Keyword,
    detail,
    insertText: label,
    range
  };
}

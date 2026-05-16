import type * as Monaco from "monaco-editor";

export const BICKSPEC_DARK_THEME = "bickspec-dark";
export const BICKSPEC_LIGHT_THEME = "bickspec-light";

export function registerBickSpecThemes(monaco: typeof Monaco) {
  monaco.editor.defineTheme(BICKSPEC_DARK_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "50DCC1", fontStyle: "bold" },
      { token: "constant", foreground: "A9E7DD" },
      { token: "predefined", foreground: "7FD8CC" },
      { token: "currency", foreground: "F2C879" },
      { token: "type", foreground: "A9C8C0" },
      { token: "identifier", foreground: "DDE4E0" },
      { token: "string", foreground: "A9E7DD" },
      { token: "number", foreground: "F2C879" },
      { token: "number.float", foreground: "F2C879" },
      { token: "operator", foreground: "8FDAD0" },
      { token: "delimiter", foreground: "BBCAC4" },
      { token: "comment", foreground: "85948F", fontStyle: "italic" }
    ],
    colors: {
      "editor.background": "#090F0E",
      "editor.foreground": "#DDE4E0",
      "editorLineNumber.foreground": "#85948F",
      "editorLineNumber.activeForeground": "#DDE4E0",
      "editorCursor.foreground": "#50DCC1",
      "editor.selectionBackground": "#164B45",
      "editor.inactiveSelectionBackground": "#123A36",
      "editor.lineHighlightBackground": "#121A18",
      "editorBracketMatch.background": "#163A36",
      "editorBracketMatch.border": "#50DCC1",
      "editorSuggestWidget.background": "#161D1B",
      "editorSuggestWidget.border": "#3C4A46",
      "editorSuggestWidget.foreground": "#DDE4E0",
      "editorSuggestWidget.selectedBackground": "#1C3531"
    }
  });

  monaco.editor.defineTheme(BICKSPEC_LIGHT_THEME, {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "006B5B", fontStyle: "bold" },
      { token: "constant", foreground: "155E57" },
      { token: "predefined", foreground: "0C7668" },
      { token: "currency", foreground: "9A5A00" },
      { token: "type", foreground: "45635C" },
      { token: "identifier", foreground: "151C21" },
      { token: "string", foreground: "006B5B" },
      { token: "number", foreground: "8A5300" },
      { token: "number.float", foreground: "8A5300" },
      { token: "operator", foreground: "006B5B" },
      { token: "delimiter", foreground: "44474D" },
      { token: "comment", foreground: "74777E", fontStyle: "italic" }
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#151C21",
      "editorLineNumber.foreground": "#74777E",
      "editorLineNumber.activeForeground": "#151C21",
      "editorCursor.foreground": "#006B5B",
      "editor.selectionBackground": "#BCE9E1",
      "editor.inactiveSelectionBackground": "#D9F2EE",
      "editor.lineHighlightBackground": "#F5FAFF",
      "editorBracketMatch.background": "#D9F2EE",
      "editorBracketMatch.border": "#006B5B",
      "editorSuggestWidget.background": "#FFFFFF",
      "editorSuggestWidget.border": "#C4C6CD",
      "editorSuggestWidget.foreground": "#151C21",
      "editorSuggestWidget.selectedBackground": "#E8EFF6"
    }
  });
}

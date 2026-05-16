import type * as monaco from "monaco-editor";

let activeEditor: monaco.editor.IStandaloneCodeEditor | null = null;

export function setActiveEditor(editor: monaco.editor.IStandaloneCodeEditor | null) {
  activeEditor = editor;
}

export function getActiveEditor() {
  return activeEditor;
}

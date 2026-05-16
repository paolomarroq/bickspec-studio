import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { BICKSPEC_LANGUAGE_ID, registerBickSpecLanguage } from "../../editor/bickspecLanguage";
import { registerBickSpecCompletions } from "../../editor/bickspecCompletions";
import { BICKSPEC_DARK_THEME, BICKSPEC_LIGHT_THEME, registerBickSpecThemes } from "../../editor/bickspecTheme";
import { setActiveEditor } from "../../editor/activeEditor";

let bickSpecSupportRegistered = false;

function ensureBickSpecSupport() {
  if (bickSpecSupportRegistered) return;
  registerBickSpecLanguage(monaco);
  registerBickSpecThemes(monaco);
  registerBickSpecCompletions(monaco);
  bickSpecSupportRegistered = true;
}

export function CodeEditor({
  content,
  filePath,
  onChange,
  readOnly = false
}: {
  content: string;
  filePath: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const modelRef = useRef<monaco.editor.ITextModel | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    ensureBickSpecSupport();
    if (!containerRef.current) return;

    const model = monaco.editor.createModel(content, BICKSPEC_LANGUAGE_ID, monaco.Uri.file(filePath));
    const editor = monaco.editor.create(containerRef.current, {
      model,
      theme: document.documentElement.dataset.theme === "dark" ? BICKSPEC_DARK_THEME : BICKSPEC_LIGHT_THEME,
      readOnly,
      automaticLayout: true,
      fontFamily: '"IBM Plex Mono", Consolas, monospace',
      fontSize: 13,
      lineHeight: 20,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 16, bottom: 16 },
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      wordBasedSuggestions: "off",
      bracketPairColorization: { enabled: false }
    });

    const subscription = editor.onDidChangeModelContent(() => {
      onChangeRef.current?.(editor.getValue());
    });
    const focusSubscription = editor.onDidFocusEditorText(() => setActiveEditor(editor));

    const observer = new MutationObserver(() => {
      monaco.editor.setTheme(document.documentElement.dataset.theme === "dark" ? BICKSPEC_DARK_THEME : BICKSPEC_LIGHT_THEME);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    editorRef.current = editor;
    modelRef.current = model;

    return () => {
      observer.disconnect();
      subscription.dispose();
      focusSubscription.dispose();
      editor.dispose();
      model.dispose();
      editorRef.current = null;
      modelRef.current = null;
      setActiveEditor(null);
    };
  }, [filePath]);

  useEffect(() => {
    const model = modelRef.current;
    if (model && model.getValue() !== content) model.setValue(content);
  }, [content]);

  useEffect(() => {
    editorRef.current?.updateOptions({ readOnly });
  }, [readOnly]);

  return <div ref={containerRef} className="code-editor monaco-code-editor" data-studio-editor="active" />;
}

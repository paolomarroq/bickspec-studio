export function CodeEditor({
  content,
  onChange,
  readOnly = false
}: {
  content: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}) {
  return (
    <textarea
      className="code-editor code-textarea"
      data-studio-editor="active"
      value={content}
      readOnly={readOnly}
      spellCheck={false}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}

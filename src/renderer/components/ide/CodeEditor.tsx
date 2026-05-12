import { bickSpecLines, generatedJavaLines } from "../../services/mockData";

export function CodeEditor({ activeFileName }: { activeFileName: string }) {
  const lines = activeFileName.endsWith(".java") ? generatedJavaLines : bickSpecLines;

  return (
    <pre className="code-editor">
      <code>
        {lines.map((line, index) => (
          <span className="code-line" data-line={String(index + 1)} key={`${index}-${line}`}>
            {highlight(line)}
          </span>
        ))}
      </code>
    </pre>
  );
}

function highlight(line: string) {
  if (line.trim().startsWith("//")) return <span className="comment">{line}</span>;
  const parts = line.split(/(spec|input|calculate|validate|report|include|export|public|final|class|return|new|"[^"]*")/g);
  return parts.map((part, index) => {
    if (/^(spec|input|calculate|validate|report|include|export|public|final|class|return|new)$/.test(part)) {
      return <span className="kw" key={index}>{part}</span>;
    }
    if (/^".*"$/.test(part)) return <span className="str" key={index}>{part}</span>;
    return part;
  });
}


import { ChevronRight, FileCode2, FileJson, FileText, Folder, Image, Table2, TerminalSquare } from "lucide-react";
import type { ProjectFile } from "@shared/contracts/domain";

const iconMap = {
  folder: Folder,
  bks: FileCode2,
  csv: Table2,
  java: FileCode2,
  json: FileJson,
  markdown: FileText,
  log: TerminalSquare,
  svg: Image,
  dot: FileText,
  text: FileText,
  class: FileCode2,
  other: FileText
};

export function FileTree({
  files,
  selectedFileId,
  onSelect
}: {
  files: ProjectFile[];
  selectedFileId: string;
  onSelect: (file: ProjectFile) => void;
}) {
  return (
    <div style={{ padding: 10 }}>
      {files.map((file) => {
        const Icon = iconMap[file.kind];
        return (
          <button
            key={file.id}
            className={`file-row ${selectedFileId === file.id ? "active" : ""}`}
            style={{ paddingLeft: 10 + file.depth * 14 }}
            onClick={() => onSelect(file)}
          >
            {file.kind === "folder" ? <ChevronRight size={14} /> : <span style={{ width: 14 }} />}
            <Icon size={16} color={file.status === "generated" ? "var(--color-teal)" : undefined} />
            <span className="mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>
              {file.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

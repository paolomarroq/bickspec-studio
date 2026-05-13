import { ChevronDown, ChevronRight, FileCode2, FileJson, FileText, Folder, Image, Table2, TerminalSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedFolders(new Set(files.filter((file) => file.kind === "folder").map((file) => file.path)));
  }, [files]);

  const visibleFiles = useMemo(
    () =>
      files.filter((file) => {
        if (file.depth === 0) return true;
        return !files.some(
          (candidate) =>
            candidate.kind === "folder" &&
            candidate.depth < file.depth &&
            isDescendant(file.path, candidate.path) &&
            !expandedFolders.has(candidate.path)
        );
      }),
    [expandedFolders, files]
  );

  function toggleFolder(path: string) {
    setExpandedFolders((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  return (
    <div style={{ padding: 10 }}>
      {visibleFiles.map((file) => {
        const Icon = iconMap[file.kind];
        const isFolder = file.kind === "folder";
        const isExpanded = expandedFolders.has(file.path);
        return (
          <button
            key={file.id}
            className={`file-row ${selectedFileId === file.id ? "active" : ""}`}
            style={{ paddingLeft: 10 + file.depth * 14 }}
            aria-expanded={isFolder ? isExpanded : undefined}
            onClick={() => {
              if (isFolder) toggleFolder(file.path);
              else onSelect(file);
            }}
          >
            {isFolder ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span style={{ width: 14 }} />}
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

function isDescendant(filePath: string, folderPath: string): boolean {
  const normalizedFile = filePath.replace(/\\/g, "/");
  const normalizedFolder = folderPath.replace(/\\/g, "/").replace(/\/$/, "");
  return normalizedFile !== normalizedFolder && normalizedFile.startsWith(`${normalizedFolder}/`);
}

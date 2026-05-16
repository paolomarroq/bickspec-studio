import { BarChart3, BookOpen, FileCode2, FolderOpen, Home, Moon, PackageCheck, Settings, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../theme/ThemeProvider";
import type { ReactNode } from "react";
import { useState } from "react";
import { ToolbarButton } from "../ui/ToolbarButton";
import { StatusBadge } from "../ui/StatusBadge";
import { BrandLogo } from "../brand/BrandLogo";
import { useStudioSession } from "../../state/StudioSessionProvider";
import { getActiveEditor } from "../../editor/activeEditor";
import { SetupWizard } from "../../features/setup/SetupWizard";

const navItems = [
  { to: "/", label: "Welcome", icon: Home },
  { to: "/workspace", label: "Workspace", icon: FolderOpen },
  { to: "/artifacts", label: "Artifacts", icon: PackageCheck },
  { to: "/report", label: "Report", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  const { effectiveTheme, toggleTheme } = useTheme();
  const {
    activeFile,
    isRunning,
    statusMessage,
    newFile,
    openFilePicker,
    openFolderPicker,
    saveActiveFile,
    closeTab,
    runActiveFile,
    openDocumentation
  } = useStudioSession();
  const [menuMessage, setMenuMessage] = useState("");
  const ThemeIcon = effectiveTheme === "light" ? Moon : Sun;

  function showAbout() {
    setMenuMessage("BickSpec Studio - desktop IDE for BickSpec financial specifications.");
    window.setTimeout(() => setMenuMessage(""), 3000);
  }

  async function runEditorCommand(command: "undo" | "redo" | "cut" | "copy" | "paste" | "selectAll") {
    const monacoEditor = getActiveEditor();
    const target = document.activeElement;
    const inputFocused = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable);
    if (monacoEditor && !inputFocused) {
      if (command === "undo" || command === "redo") {
        monacoEditor.trigger("edit-menu", command, null);
        return;
      }
      if (command === "selectAll") {
        monacoEditor.trigger("edit-menu", "editor.action.selectAll", null);
        return;
      }
      const selection = monacoEditor.getSelection();
      if (!selection) return;
      if (command === "copy" || command === "cut") {
        const text = monacoEditor.getModel()?.getValueInRange(selection) ?? "";
        if (text) await window.bickspecStudio?.app.writeClipboardText(text);
        if (command === "cut" && text) monacoEditor.executeEdits("edit-menu", [{ range: selection, text: "" }]);
        return;
      }
      if (command === "paste") {
        const text = (await window.bickspecStudio?.app.readClipboardText()) ?? "";
        if (text) monacoEditor.executeEdits("edit-menu", [{ range: selection, text }]);
        return;
      }
    }

    const isEditable = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable);
    if (!isEditable) return;
    if (command === "paste") {
      const text = (await window.bickspecStudio?.app.readClipboardText()) ?? "";
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        target.setRangeText(text, target.selectionStart ?? 0, target.selectionEnd ?? 0, "end");
        target.dispatchEvent(new Event("input", { bubbles: true }));
      }
      return;
    }
    document.execCommand(command);
  }

  return (
    <div className="app-root">
      <header className="top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <BrandLogo variant="icon" className="chrome-logo" />
          <strong style={{ fontSize: 18 }}>BickSpec Studio</strong>
          <nav className="top-menu">
            <span className="top-menu-item">
              <button>File</button>
              <span className="top-menu-popover">
                <button onClick={newFile}>New File</button>
                <button onClick={openFilePicker}>Open File</button>
                <button onClick={openFolderPicker}>Open Folder</button>
                <button onClick={() => void saveActiveFile()} disabled={!activeFile}>Save</button>
                <button onClick={() => activeFile && void closeTab(activeFile.path)} disabled={!activeFile}>Close Tab</button>
              </span>
            </span>
            <span className="top-menu-item">
              <button>Edit</button>
              <span className="top-menu-popover">
                <button onMouseDown={(event) => event.preventDefault()} onClick={() => void runEditorCommand("undo")}>Undo</button>
                <button onMouseDown={(event) => event.preventDefault()} onClick={() => void runEditorCommand("redo")}>Redo</button>
                <button onMouseDown={(event) => event.preventDefault()} onClick={() => void runEditorCommand("cut")}>Cut</button>
                <button onMouseDown={(event) => event.preventDefault()} onClick={() => void runEditorCommand("copy")}>Copy</button>
                <button onMouseDown={(event) => event.preventDefault()} onClick={() => void runEditorCommand("paste")}>Paste</button>
                <button onMouseDown={(event) => event.preventDefault()} onClick={() => void runEditorCommand("selectAll")}>Select All</button>
              </span>
            </span>
            <button onClick={toggleTheme}>View</button>
            <button onClick={openFolderPicker}>Window</button>
            <button onClick={showAbout}>About</button>
          </nav>
          <span className="label-caps">{activeFile?.name ?? "No file open"}</span>
          <StatusBadge tone={isRunning ? "neutral" : "success"}>{isRunning ? "Running" : "Ready"}</StatusBadge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ToolbarButton icon={<BookOpen size={16} />} onClick={openDocumentation}>Documentation</ToolbarButton>
          <ToolbarButton primary icon={<FileCode2 size={16} />} onClick={runActiveFile}>Run</ToolbarButton>
          <button className="button" onClick={toggleTheme} aria-label="Toggle color theme">
            <ThemeIcon size={16} />
          </button>
        </div>
      </header>
      <div className="layout">
        <aside className="activity-bar" aria-label="Primary navigation">
          <nav>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `activity-button${isActive ? " active" : ""}`}
                title={item.label}
              >
                <item.icon size={20} />
              </NavLink>
            ))}
          </nav>
          <button className="activity-button" onClick={toggleTheme} title="Toggle theme">
            <ThemeIcon size={20} />
          </button>
        </aside>
        <main className="main-view">{children}</main>
      </div>
      <footer className="status-bar">
        <span>{statusMessage}</span>
        <span>{menuMessage || "UTF-8 | LF | Spec Grid UI"}</span>
      </footer>
      <SetupWizard />
    </div>
  );
}

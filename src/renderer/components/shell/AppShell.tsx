import { BarChart3, Bell, BookOpen, FileCode2, FolderOpen, Home, Moon, PackageCheck, Search, Settings, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../theme/ThemeProvider";
import type { ReactNode } from "react";
import { useState } from "react";
import { ToolbarButton } from "../ui/ToolbarButton";
import { StatusBadge } from "../ui/StatusBadge";
import { BrandLogo } from "../brand/BrandLogo";

const navItems = [
  { to: "/", label: "Welcome", icon: Home },
  { to: "/workspace", label: "Workspace", icon: FolderOpen },
  { to: "/artifacts", label: "Artifacts", icon: PackageCheck },
  { to: "/report", label: "Report", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [statusMessage, setStatusMessage] = useState("BickSpec language server: mock");
  const ThemeIcon = theme === "light" ? Moon : Sun;

  function showActionFeedback(action: string) {
    setStatusMessage(`${action}: queued in mock UI`);
    window.setTimeout(() => setStatusMessage(`${action}: mock completed`), 450);
    window.setTimeout(() => setStatusMessage("BickSpec language server: mock"), 1400);
  }

  return (
    <div className="app-root">
      <header className="top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <BrandLogo variant="icon" className="chrome-logo" />
          <strong style={{ fontSize: 18 }}>BickSpec Studio</strong>
          <nav className="top-menu">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
          </nav>
          <span className="label-caps">portfolio-analysis.bks</span>
          <StatusBadge>Ready</StatusBadge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="icon-button" aria-label="Search">
            <Search size={16} />
          </button>
          <ToolbarButton icon={<BookOpen size={16} />} onClick={() => showActionFeedback("Documentation")}>Documentation</ToolbarButton>
          <ToolbarButton primary icon={<FileCode2 size={16} />} onClick={() => showActionFeedback("Run")}>Run</ToolbarButton>
          <ToolbarButton onClick={() => showActionFeedback("Compile")}>Compile</ToolbarButton>
          <ToolbarButton onClick={() => showActionFeedback("Generate Java")}>Generate Java</ToolbarButton>
          <button className="icon-button" aria-label="Notifications">
            <Bell size={16} />
          </button>
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
        <span>UTF-8 | LF | Spec Grid UI</span>
      </footer>
    </div>
  );
}

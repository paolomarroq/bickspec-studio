import { BarChart3, Bell, FileCode2, FolderOpen, Home, Moon, PackageCheck, Search, Settings, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../theme/ThemeProvider";
import type { ReactNode } from "react";
import { ToolbarButton } from "../ui/ToolbarButton";
import { StatusBadge } from "../ui/StatusBadge";

const navItems = [
  { to: "/", label: "Welcome", icon: Home },
  { to: "/workspace", label: "Workspace", icon: FolderOpen },
  { to: "/artifacts", label: "Artifacts", icon: PackageCheck },
  { to: "/report", label: "Report", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const ThemeIcon = theme === "light" ? Moon : Sun;

  return (
    <div className="app-root">
      <header className="top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <strong style={{ fontSize: 18 }}>BickSpec Studio</strong>
          <nav className="top-menu">
            <span>File</span>
            <span>Edit</span>
            <span>Selection</span>
            <span>View</span>
            <span>Go</span>
          </nav>
          <span className="label-caps">portfolio-analysis.bks</span>
          <StatusBadge>Ready</StatusBadge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="icon-button" aria-label="Search">
            <Search size={16} />
          </button>
          <ToolbarButton primary icon={<FileCode2 size={16} />}>Run</ToolbarButton>
          <ToolbarButton>Compile</ToolbarButton>
          <ToolbarButton>Generate Java</ToolbarButton>
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
        <span>BickSpec language server: mock</span>
        <span>UTF-8 | LF | Spec Grid UI</span>
      </footer>
    </div>
  );
}

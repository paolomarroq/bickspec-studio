import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function LauncherActionCard({
  to,
  title,
  description,
  icon,
  primary = false,
  onClick
}: {
  to: string;
  title: string;
  description: string;
  icon: ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link to={to} className={`action-card ${primary ? "primary" : ""}`} onClick={(event) => {
      if (onClick) {
        event.preventDefault();
        onClick();
      }
    }}>
      {icon}
      <strong style={{ fontSize: 18 }}>{title}</strong>
      <span style={{ color: primary ? "rgba(255,255,255,0.82)" : "var(--color-text-muted)", lineHeight: 1.45 }}>{description}</span>
    </Link>
  );
}

import type { ReactNode } from "react";

export function ToolbarButton({
  children,
  icon,
  primary = false,
  onClick,
  disabled = false
}: {
  children: ReactNode;
  icon?: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className={`button ${primary ? "primary" : ""}`} onClick={onClick} disabled={disabled}>
      {icon}
      {children}
    </button>
  );
}

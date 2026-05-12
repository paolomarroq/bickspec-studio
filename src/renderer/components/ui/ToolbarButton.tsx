import type { ReactNode } from "react";

export function ToolbarButton({
  children,
  icon,
  primary = false,
  onClick
}: {
  children: ReactNode;
  icon?: ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={`button ${primary ? "primary" : ""}`} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}


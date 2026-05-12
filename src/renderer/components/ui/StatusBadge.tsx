import { CheckCircle2, CircleAlert, CircleDot } from "lucide-react";

export function StatusBadge({ children, tone = "success" }: { children: string; tone?: "success" | "warn" | "neutral" }) {
  const Icon = tone === "warn" ? CircleAlert : tone === "neutral" ? CircleDot : CheckCircle2;
  return (
    <span className={`badge ${tone === "warn" ? "warn" : tone === "neutral" ? "neutral" : ""}`}>
      <Icon size={13} />
      {children}
    </span>
  );
}


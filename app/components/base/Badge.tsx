import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "primary" | "info" | "success" | "warning" | "danger";

export function Badge({ tone = "neutral", dot = false, children, className = "" }: { tone?: BadgeTone; dot?: boolean; children: ReactNode; className?: string }) {
  return <span className={`ds-badge ds-badge--${tone} ${className}`}>{dot && <span className="ds-badge__dot" aria-hidden="true" />}{children}</span>;
}

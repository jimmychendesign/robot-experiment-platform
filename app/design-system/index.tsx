"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { LoaderCircle, X } from "lucide-react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary" | "destructive" | "link";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
};

export function Button({ variant = "primary", size = "md", loading = false, leadingIcon, trailingIcon, fullWidth = false, children, className = "", disabled, ...props }: ButtonProps) {
  return <button className={`button button--${variant} button--${size} ${fullWidth ? "button--full" : ""} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading ? <LoaderCircle aria-hidden="true" className="button__spinner" /> : leadingIcon}
    {children && <span>{children}</span>}
    {!loading && trailingIcon}
  </button>;
}

export function IconButton({ label, icon, variant = "tertiary", size = "md", ...props }: Omit<ButtonProps, "children" | "leadingIcon"> & { label: string; icon: ReactNode }) {
  return <Button className="icon-button" aria-label={label} title={label} variant={variant} size={size} {...props}>{icon}</Button>;
}

export type BadgeTone = "neutral" | "primary" | "info" | "success" | "warning" | "danger";
export function Badge({ tone = "neutral", dot = false, icon, children, className = "" }: { tone?: BadgeTone; dot?: boolean; icon?: ReactNode; children: ReactNode; className?: string }) {
  return <span className={`axis-badge axis-badge--${tone} ${className}`}>{dot && <span className="status-dot" aria-hidden="true" />}{icon && <span className="axis-badge__icon" aria-hidden="true">{icon}</span>}{children}</span>;
}

export function Tabs({ items, value, onValueChange, label }: { items: { value: string; label: string; icon?: ReactNode }[]; value: string; onValueChange: (value: string) => void; label: string }) {
  return <TabsPrimitive.Root className="axis-tabs" value={value} onValueChange={onValueChange}>
    <TabsPrimitive.List className="axis-tabs__list" aria-label={label}>{items.map(item => <TabsPrimitive.Trigger className="axis-tabs__trigger" value={item.value} key={item.value}>{item.icon}{item.label}</TabsPrimitive.Trigger>)}</TabsPrimitive.List>
  </TabsPrimitive.Root>;
}

export function Tooltip({ children, content, description, side = "top" }: { children: ReactNode; content: string; description?: string; side?: "top" | "right" | "bottom" | "left" }) {
  return <TooltipPrimitive.Provider delayDuration={250}><TooltipPrimitive.Root><TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger><TooltipPrimitive.Portal><TooltipPrimitive.Content className="axis-tooltip" side={side} sideOffset={7}><strong>{content}</strong>{description && <small>{description}</small>}<TooltipPrimitive.Arrow className="axis-tooltip__arrow" /></TooltipPrimitive.Content></TooltipPrimitive.Portal></TooltipPrimitive.Root></TooltipPrimitive.Provider>;
}

export function MetricCard({ label, value, description, icon, tone = "neutral", progress }: { label: string; value: ReactNode; description: string; icon?: ReactNode; tone?: BadgeTone; progress?: number }) {
  return <article className={`axis-metric axis-metric--${tone}`}><div className="axis-metric__head"><span>{label}</span>{icon && <span aria-hidden="true">{icon}</span>}</div><strong>{value}</strong><p>{description}</p>{typeof progress === "number" && <div className="axis-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{ "--progress": `${Math.max(0, Math.min(progress, 100))}%` } as React.CSSProperties} /></div>}</article>;
}

export function Surface({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`axis-surface ${className}`} {...props} />;
}

export function DialogFrame({ open, onOpenChange, title, description, size = "md", children, footer }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; size?: "sm" | "md" | "lg" | "xl"; children: ReactNode; footer?: ReactNode }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}><DialogPrimitive.Portal><DialogPrimitive.Overlay className="axis-overlay" /><DialogPrimitive.Content className={`axis-dialog axis-dialog--${size}`}><header className="axis-dialog__header"><div><DialogPrimitive.Title>{title}</DialogPrimitive.Title>{description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}</div><DialogPrimitive.Close asChild><IconButton label="关闭" icon={<X aria-hidden="true" />} /></DialogPrimitive.Close></header><div className="axis-dialog__body">{children}</div>{footer && <footer className="axis-dialog__footer">{footer}</footer>}</DialogPrimitive.Content></DialogPrimitive.Portal></DialogPrimitive.Root>;
}

export function DrawerFrame({ open, onOpenChange, title, description, children, footer, side = "right" }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; side?: "left" | "right" }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}><DialogPrimitive.Portal><DialogPrimitive.Overlay className="axis-overlay" /><DialogPrimitive.Content className={`axis-drawer axis-drawer--${side}`}><header className="axis-dialog__header"><div><DialogPrimitive.Title>{title}</DialogPrimitive.Title>{description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}</div><DialogPrimitive.Close asChild><IconButton label="关闭" icon={<X aria-hidden="true" />} /></DialogPrimitive.Close></header><div className="axis-drawer__body">{children}</div>{footer && <footer className="axis-dialog__footer">{footer}</footer>}</DialogPrimitive.Content></DialogPrimitive.Portal></DialogPrimitive.Root>;
}

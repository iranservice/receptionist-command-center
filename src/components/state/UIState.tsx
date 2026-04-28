// LV-6 — Reusable UI states.
// Pure presentation. Backend remains source of truth; these are placeholders
// to be wired to loader / query results in a later phase.

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  AlertTriangle,
  Lock,
  Hourglass,
  Loader2,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type Tone = "neutral" | "warn" | "danger" | "info" | "muted";

const TONE: Record<Tone, { iconBg: string; iconFg: string; ring: string }> = {
  neutral: { iconBg: "bg-muted", iconFg: "text-muted-foreground", ring: "ring-border" },
  muted: { iconBg: "bg-muted/60", iconFg: "text-muted-foreground", ring: "ring-border" },
  warn: { iconBg: "bg-warn/20", iconFg: "text-warn-foreground", ring: "ring-warn/30" },
  danger: {
    iconBg: "bg-destructive/12",
    iconFg: "text-destructive",
    ring: "ring-destructive/25",
  },
  info: { iconBg: "bg-primary/12", iconFg: "text-primary", ring: "ring-primary/20" },
};

export type UIStateAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
};

export function UIState({
  icon: Icon = Inbox,
  title,
  description,
  tone = "neutral",
  actions,
  children,
  className,
  size = "md",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  tone?: Tone;
  actions?: UIStateAction[];
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md";
}) {
  const t = TONE[tone];
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 px-6 text-center",
        size === "sm" ? "py-8" : "py-14",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full ring-1",
          size === "sm" ? "h-10 w-10" : "h-12 w-12",
          t.iconBg,
          t.iconFg,
          t.ring,
        )}
      >
        <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      <div className="max-w-md space-y-1">
        <p className={cn("font-medium", size === "sm" ? "text-sm" : "text-base")}>{title}</p>
        {description && <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>}
      </div>
      {children}
      {actions && actions.length > 0 && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {actions.map((a) => {
            const Icn = a.icon;
            const btn = (
              <Button
                key={a.label}
                size="sm"
                variant={a.variant ?? "outline"}
                onClick={a.onClick}
                className="gap-1.5"
              >
                {Icn && <Icn className="h-3.5 w-3.5" />}
                {a.label}
              </Button>
            );
            return a.href ? (
              <a key={a.label} href={a.href}>
                {btn}
              </a>
            ) : (
              btn
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EmptyState(props: Omit<Parameters<typeof UIState>[0], "tone">) {
  return <UIState tone="neutral" icon={props.icon ?? Inbox} {...props} />;
}

export function LoadingState({
  title = "Loading…",
  description,
  size = "md",
  className,
}: {
  title?: string;
  description?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 px-6 text-center",
        size === "sm" ? "py-8" : "py-14",
        className,
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-muted-foreground",
          size === "sm" ? "h-5 w-5" : "h-6 w-6",
        )}
      />
      <div className="max-w-md space-y-0.5">
        <p className={cn("font-medium", size === "sm" ? "text-sm" : "text-base")}>{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this section. The backend is the source of truth — try again in a moment.",
  onRetry,
  size = "md",
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <UIState
      icon={AlertTriangle}
      tone="danger"
      title={title}
      description={description}
      size={size}
      className={className}
      actions={
        onRetry
          ? [{ label: "Retry", icon: RefreshCw, onClick: onRetry, variant: "outline" }]
          : undefined
      }
    />
  );
}

export function DeniedState({
  title = "You don't have access to this view",
  description = "Permissions are decided by the backend. Ask a workspace admin if you think this is wrong.",
  size = "md",
  className,
}: {
  title?: string;
  description?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <UIState
      icon={Lock}
      tone="warn"
      title={title}
      description={description}
      size={size}
      className={className}
    />
  );
}

export function PendingState({
  title = "Pending",
  description,
  size = "sm",
  className,
}: {
  title?: string;
  description?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <UIState
      icon={Hourglass}
      tone="warn"
      title={title}
      description={description}
      size={size}
      className={className}
    />
  );
}

/** Simple row-skeleton list for loading lists/tables. */
export function SkeletonList({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <ul className={cn("divide-y", className)} aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Construction, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  meta,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="border-b bg-card/40">
      <div className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
          {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  trend,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "ai" | "operator" | "warn" | "success";
}) {
  const toneClass = {
    default: "bg-primary/10 text-primary",
    ai: "bg-ai/15 text-ai",
    operator: "bg-operator/20 text-operator-foreground",
    warn: "bg-warn/25 text-warn-foreground",
    success: "bg-success/15 text-success",
  }[tone];

  return (
    <Card className="p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <span className={`flex h-7 w-7 items-center justify-center rounded-md ${toneClass}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </span>
        {delta && (
          <span
            className={[
              "inline-flex items-center gap-0.5 text-xs font-medium",
              trend === "up" && "text-success",
              trend === "down" && "text-destructive",
              (!trend || trend === "flat") && "text-muted-foreground",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-foreground/70">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PlaceholderArea({
  title,
  scope,
  notes,
  contract,
  icon: Icon,
}: {
  title: string;
  scope: "Level A" | "Level B";
  notes: string[];
  contract?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="overflow-hidden p-0 shadow-xs">
      <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-card text-muted-foreground shadow-xs">
            {Icon ? <Icon className="h-3.5 w-3.5" /> : <Construction className="h-3.5 w-3.5" />}
          </span>
          <h3 className="font-display text-sm font-semibold">{title}</h3>
          <Badge
            className={
              scope === "Level A"
                ? "ml-1 h-5 border-0 bg-level-a/12 px-1.5 text-[10px] font-medium text-level-a"
                : "ml-1 h-5 border-0 bg-level-b/12 px-1.5 text-[10px] font-medium text-level-b"
            }
            variant="secondary"
          >
            {scope}
          </Badge>
        </div>
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground">
          Structure · later phase
        </Badge>
      </div>
      <div className="px-5 py-4">
        <ul className="space-y-1.5 text-sm text-foreground/85">
          {notes.map((n) => (
            <li key={n} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
        {contract && (
          <div className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Backend contract: </span>
            {contract}
          </div>
        )}
      </div>
    </Card>
  );
}

/* Backwards-compat alias used by some routes */
export const Placeholder = PlaceholderArea;

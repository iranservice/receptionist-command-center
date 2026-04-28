import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

/**
 * Shared section wrapper for settings pages so Level A and Level B
 * settings feel the same shape, but visual context (level pill) makes
 * the scope unambiguous.
 */
export function SettingsSection({
  title,
  description,
  scope,
  action,
  children,
}: {
  title: string;
  description?: string;
  scope?: "Level A" | "Level B";
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-0 shadow-xs">
      <div className="flex flex-col gap-1 border-b bg-muted/40 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-semibold">{title}</h3>
            {scope && (
              <Badge
                variant="secondary"
                className={
                  scope === "Level A"
                    ? "h-5 border-0 bg-level-a/12 px-1.5 text-[10px] font-medium text-level-a"
                    : "h-5 border-0 bg-level-b/12 px-1.5 text-[10px] font-medium text-level-b"
                }
              >
                {scope}
              </Badge>
            )}
          </div>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      <div className="px-5 py-5">{children}</div>
    </Card>
  );
}

export function SettingsField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-foreground/85">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function BackendNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
      <span className="font-semibold text-foreground">Backend contract: </span>
      {children}
    </div>
  );
}

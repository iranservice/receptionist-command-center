import { cn } from "@/lib/utils";
import { OP_STATE, SEVERITY, type OpState, type Severity } from "@/lib/op-states";

export function OpStateBadge({
  state,
  className,
  size = "sm",
}: {
  state: OpState;
  className?: string;
  size?: "xs" | "sm";
}) {
  const meta = OP_STATE[state];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium uppercase tracking-wider",
        size === "xs" ? "h-5 px-1.5 text-[10px]" : "h-6 px-2 text-[11px]",
        meta.badgeCls,
        className,
      )}
    >
      <Icon className={size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {meta.label}
    </span>
  );
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const m = SEVERITY[severity];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium uppercase tracking-wider",
        m.cls,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function StateDot({ state, className }: { state: OpState; className?: string }) {
  return (
    <span
      className={cn("inline-block h-1.5 w-1.5 rounded-full", OP_STATE[state].dotCls, className)}
      aria-hidden
    />
  );
}

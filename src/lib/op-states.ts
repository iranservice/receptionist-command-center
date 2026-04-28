// LV-5 — Operational state vocabulary.
// One source of presentation truth used by approvals, analytics, dashboard cards.
// Backend remains source of truth for actual state transitions.

import {
  AlertTriangle,
  Ban,
  Bot,
  CheckCircle2,
  Clock,
  CircleAlert,
  CircleSlash,
  Hourglass,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  User,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type OpState =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "cancelled"
  | "failed"
  | "blocked"
  | "needs_attention"
  | "handoff_required"
  | "waiting_customer"
  | "ai_blocked"
  | "operator_active"
  | "customer_confirmation_pending";

type OpStateMeta = {
  label: string;
  icon: LucideIcon;
  // Tailwind color tokens, all from semantic theme.
  badgeCls: string;
  dotCls: string;
  tone: "neutral" | "info" | "warn" | "success" | "danger" | "ai" | "operator";
};

export const OP_STATE: Record<OpState, OpStateMeta> = {
  pending: {
    label: "Pending",
    icon: Hourglass,
    badgeCls: "bg-warn/20 text-warn-foreground border-warn/40",
    dotCls: "bg-warn",
    tone: "warn",
  },
  approved: {
    label: "Approved",
    icon: ShieldCheck,
    badgeCls: "bg-success/15 text-success border-success/30",
    dotCls: "bg-success",
    tone: "success",
  },
  rejected: {
    label: "Rejected",
    icon: ShieldX,
    badgeCls: "bg-destructive/12 text-destructive border-destructive/30",
    dotCls: "bg-destructive",
    tone: "danger",
  },
  expired: {
    label: "Expired",
    icon: Clock,
    badgeCls: "bg-muted text-muted-foreground border-border",
    dotCls: "bg-muted-foreground/50",
    tone: "neutral",
  },
  cancelled: {
    label: "Cancelled",
    icon: CircleSlash,
    badgeCls: "bg-muted text-muted-foreground border-border",
    dotCls: "bg-muted-foreground/50",
    tone: "neutral",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    badgeCls: "bg-destructive/12 text-destructive border-destructive/30",
    dotCls: "bg-destructive",
    tone: "danger",
  },
  blocked: {
    label: "Blocked",
    icon: Ban,
    badgeCls: "bg-destructive/10 text-destructive border-destructive/25",
    dotCls: "bg-destructive",
    tone: "danger",
  },
  needs_attention: {
    label: "Needs attention",
    icon: AlertTriangle,
    badgeCls: "bg-warn/25 text-warn-foreground border-warn/45",
    dotCls: "bg-warn",
    tone: "warn",
  },
  handoff_required: {
    label: "Handoff required",
    icon: ShieldAlert,
    badgeCls: "bg-warn/30 text-warn-foreground border-warn/50",
    dotCls: "bg-warn",
    tone: "warn",
  },
  waiting_customer: {
    label: "Waiting customer",
    icon: Clock,
    badgeCls: "bg-muted text-muted-foreground border-border",
    dotCls: "bg-muted-foreground/60",
    tone: "neutral",
  },
  ai_blocked: {
    label: "AI blocked",
    icon: Bot,
    badgeCls: "bg-ai/15 text-ai border-ai/30",
    dotCls: "bg-ai",
    tone: "ai",
  },
  operator_active: {
    label: "Operator active",
    icon: User,
    badgeCls: "bg-operator/25 text-operator-foreground border-operator/40",
    dotCls: "bg-operator",
    tone: "operator",
  },
  customer_confirmation_pending: {
    label: "Awaiting customer confirmation",
    icon: CircleAlert,
    badgeCls: "bg-warn/20 text-warn-foreground border-warn/40",
    dotCls: "bg-warn",
    tone: "warn",
  },
};

/** Severity levels used by approvals and ops cards. */
export type Severity = "low" | "medium" | "high" | "critical";

export const SEVERITY: Record<Severity, { label: string; cls: string; dot: string }> = {
  low: {
    label: "Low",
    cls: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/50",
  },
  medium: {
    label: "Medium",
    cls: "bg-chart-3/15 text-foreground border-chart-3/30",
    dot: "bg-chart-3",
  },
  high: {
    label: "High",
    cls: "bg-warn/25 text-warn-foreground border-warn/45",
    dot: "bg-warn",
  },
  critical: {
    label: "Critical",
    cls: "bg-destructive/12 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
};

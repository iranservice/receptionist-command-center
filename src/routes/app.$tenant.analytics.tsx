import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, SectionHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpStateBadge } from "@/components/state/OpStateBadge";
import {
  Activity,
  Bot,
  User,
  ArrowRightLeft,
  ShoppingBag,
  CheckCircle2,
  CircleAlert,
  ShieldAlert,
  ShieldX,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/$tenant/analytics")({
  component: TenantAnalytics,
});

function TenantAnalytics() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Operational signals for the last 7 days. Backend will provide truth — values shown are illustrative."
        meta={
          <>
            <Badge variant="outline" className="gap-1 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live · 7d window
            </Badge>
            <Badge variant="outline" className="font-normal">
              Tenant scope
            </Badge>
          </>
        }
      />

      <div className="space-y-8 p-6">
        {/* KPI strip */}
        <section>
          <SectionHeader title="Operational KPIs" description="At-a-glance counters." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total conversations"
              value="1,284"
              delta="+11%"
              trend="up"
              icon={Activity}
              hint="vs. previous 7d"
            />
            <StatCard
              label="AI replies"
              value="3,902"
              delta="64%"
              trend="up"
              icon={Bot}
              tone="ai"
              hint="of total replies"
            />
            <StatCard
              label="Operator replies"
              value="2,196"
              delta="36%"
              trend="flat"
              icon={User}
              tone="operator"
            />
            <StatCard
              label="Avg. response time"
              value="42s"
              delta="-8s"
              trend="down"
              icon={Clock}
              tone="success"
              hint="placeholder metric"
            />
          </div>
        </section>

        {/* Order + handoff */}
        <section>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Orders created"
              value="318"
              delta="+22"
              trend="up"
              icon={ShoppingBag}
            />
            <StatCard
              label="Orders confirmed"
              value="284"
              delta="89%"
              trend="up"
              icon={CheckCircle2}
              tone="success"
              hint="confirmation rate"
            />
            <StatCard
              label="Pending confirmations"
              value="9"
              icon={CircleAlert}
              tone="warn"
              hint="awaiting customer"
            />
            <StatCard
              label="Handoffs"
              value="74"
              delta="5.8%"
              trend="flat"
              icon={ArrowRightLeft}
              tone="warn"
              hint="of conversations"
            />
          </div>
        </section>

        {/* Two-up: AI vs Operator + Channel mix */}
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold">AI vs Operator handling</h3>
                <p className="text-xs text-muted-foreground">Share of replies · 7d</p>
              </div>
              <Badge variant="outline" className="font-normal">
                6,098 replies
              </Badge>
            </div>

            <div className="mt-5">
              <div className="flex h-3 w-full overflow-hidden rounded-md border">
                <div className="bg-ai/70" style={{ width: "64%" }} aria-label="AI 64%" />
                <div
                  className="bg-operator/70"
                  style={{ width: "36%" }}
                  aria-label="Operator 36%"
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-ai/70" />
                  <span className="text-foreground/85">AI</span>
                  <span className="font-medium tabular-nums">64% · 3,902</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-operator/70" />
                  <span className="text-foreground/85">Operator</span>
                  <span className="font-medium tabular-nums">36% · 2,196</span>
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <Mini label="Handoff rate" value="5.8%" hint="74 of 1,284" />
              <Mini label="Released to AI" value="58" hint="back to AI" />
              <Mini label="AI confidence avg" value="0.82" hint="placeholder" />
            </div>
          </Card>

          <Card className="p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold">Channel breakdown</h3>
                <p className="text-xs text-muted-foreground">Conversations by channel · 7d</p>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                {
                  name: "WhatsApp",
                  icon: MessageSquare,
                  value: 812,
                  pct: 63,
                  cls: "bg-success/60",
                },
                { name: "Web chat", icon: Globe, value: 268, pct: 21, cls: "bg-primary/60" },
                { name: "SMS", icon: Phone, value: 142, pct: 11, cls: "bg-chart-3/70" },
                { name: "Email", icon: Mail, value: 62, pct: 5, cls: "bg-chart-2/70" },
              ].map((c) => (
                <li key={c.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <c.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {c.name}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {c.value} · {c.pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-sm bg-muted">
                    <div className={cn("h-full", c.cls)} style={{ width: `${c.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Approvals + operational state breakdown */}
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold">Approvals · 7d</h3>
                <p className="text-xs text-muted-foreground">
                  Internal sign-off — not customer confirmation
                </p>
              </div>
              <ShieldAlert className="h-4 w-4 text-warn" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Mini label="Pending" value="5" tone="warn" />
              <Mini label="Approved" value="22" tone="success" />
              <Mini label="Rejected" value="6" tone="danger" />
              <Mini label="Expired" value="3" />
            </div>
            <div className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Backend contract: </span>
              approval decisions, SLA windows, and routing belong to the backend; UI only renders
              counts and statuses.
            </div>
          </Card>

          <Card className="p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold">Operational states</h3>
                <p className="text-xs text-muted-foreground">
                  Distribution across active conversations
                </p>
              </div>
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  ["ai_blocked", 3],
                  ["operator_active", 9],
                  ["handoff_required", 2],
                  ["waiting_customer", 14],
                  ["customer_confirmation_pending", 5],
                  ["needs_attention", 4],
                ] as const
              ).map(([s, n]) => (
                <li
                  key={s}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <OpStateBadge state={s} size="xs" />
                  <span className="text-sm font-medium tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Trend */}
        <section>
          <Card className="p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold">Conversation trend</h3>
                <p className="text-xs text-muted-foreground">Last 14 days</p>
              </div>
              <Badge variant="outline" className="font-normal">
                Illustrative
              </Badge>
            </div>
            <div className="mt-5 flex h-32 items-end gap-2">
              {[32, 41, 38, 52, 49, 60, 55, 68, 64, 72, 70, 81, 76, 88].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-stretch gap-px">
                  <div
                    className="rounded-sm bg-ai/70"
                    style={{ height: `${v * 0.9}px`, opacity: 0.65 + i / 60 }}
                    aria-hidden
                  />
                  <div
                    className="rounded-sm bg-operator/70"
                    style={{ height: `${v / 2}px`, opacity: 0.7 }}
                    aria-hidden
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-ai/70" /> AI replies
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-operator/70" /> Operator replies
              </span>
              <span className="ml-auto text-muted-foreground">Backend-driven later</span>
            </div>
          </Card>
        </section>

        {/* Rejected / blocked highlights — clear but not chaotic */}
        <section>
          <SectionHeader
            title="Watch list"
            description="Flagged outcomes worth a glance — not necessarily a problem."
          />
          <div className="grid gap-3 md:grid-cols-3">
            <WatchItem
              icon={ShieldX}
              tone="danger"
              title="6 approvals rejected"
              hint="Most common reason: policy threshold"
            />
            <WatchItem
              icon={CircleAlert}
              tone="warn"
              title="9 customer confirmations pending"
              hint="Average wait: 22 min"
            />
            <WatchItem
              icon={ArrowRightLeft}
              tone="warn"
              title="3 conversations re-handed-off"
              hint="≥ 2 handoffs in same session"
            />
          </div>
        </section>
      </div>
    </>
  );
}

function Mini({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warn" | "danger";
}) {
  const cls = {
    default: "text-foreground",
    success: "text-success",
    warn: "text-warn-foreground",
    danger: "text-destructive",
  }[tone];
  return (
    <div className="rounded-md border px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-0.5 font-display text-lg font-semibold tabular-nums", cls)}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function WatchItem({
  icon: Icon,
  tone,
  title,
  hint,
}: {
  icon: typeof ShieldX;
  tone: "warn" | "danger";
  title: string;
  hint: string;
}) {
  const cls =
    tone === "danger"
      ? "bg-destructive/10 text-destructive border-destructive/25"
      : "bg-warn/20 text-warn-foreground border-warn/40";
  return (
    <Card className="flex items-start gap-3 p-4 shadow-xs">
      <span
        className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md border", cls)}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </Card>
  );
}

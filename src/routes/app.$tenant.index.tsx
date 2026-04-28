import type { ComponentProps } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  PageHeader,
  StatCard,
  SectionHeader,
  PlaceholderArea,
} from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpStateBadge } from "@/components/state/OpStateBadge";
import {
  Inbox,
  Bot,
  User,
  ShieldAlert,
  ShoppingBag,
  CalendarClock,
  Mic,
  ArrowRight,
  Activity,
  Plug,
  BarChart3,
  CircleAlert,
  CheckCircle2,
  ShieldCheck,
  ArrowRightLeft,
} from "lucide-react";
import { demoTenants } from "@/lib/nav-config";

export const Route = createFileRoute("/app/$tenant/")({
  component: TenantDashboard,
});

function TenantDashboard() {
  const { tenant } = useParams({ from: "/app/$tenant/" });
  const t = demoTenants.find((x) => x.slug === tenant) ?? demoTenants[0];

  return (
    <>
      <PageHeader
        title="Workspace overview"
        description={`Live operational pulse for ${t.name}. Counts and states are illustrative — backend will provide truth.`}
        meta={
          <>
            <Badge variant="outline" className="gap-1 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Channels healthy
            </Badge>
            <Badge variant="outline" className="font-normal">
              {t.type}
            </Badge>
            <span className="text-xs text-muted-foreground">Updated just now</span>
          </>
        }
        actions={
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/app/$tenant/inbox" params={{ tenant: t.slug }}>
              <Inbox className="h-4 w-4" /> Open Inbox
            </Link>
          </Button>
        }
      />

      <div className="space-y-8 p-6">
        {/* KPIs */}
        <section>
          <SectionHeader
            title="Today"
            description="Operational signals across the inbox and order flow."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Open conversations"
              value="24"
              delta="+6"
              trend="up"
              icon={Inbox}
              hint="vs. yesterday"
            />
            <StatCard
              label="AI handling"
              value="11"
              delta="46%"
              trend="flat"
              icon={Bot}
              tone="ai"
              hint="of open"
            />
            <StatCard
              label="Operator handling"
              value="9"
              delta="38%"
              trend="flat"
              icon={User}
              tone="operator"
              hint="of open"
            />
            <StatCard
              label="Needs approval"
              value="2"
              delta="urgent"
              trend="down"
              icon={ShieldAlert}
              tone="warn"
              hint="awaiting sign-off"
            />
          </div>
        </section>

        {/* Live state + channels */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold">Conversation flow</h3>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
              <Badge variant="outline" className="gap-1 font-normal">
                <Activity className="h-3 w-3" /> Live
              </Badge>
            </div>
            {/* Lightweight illustrative bars (no chart lib needed) */}
            <div className="mt-5 flex h-32 items-end gap-1.5">
              {[
                5, 8, 6, 9, 12, 14, 11, 16, 13, 18, 15, 20, 17, 22, 19, 24, 21, 18, 16, 14, 12, 10,
                9, 11,
              ].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col gap-px">
                  <div
                    className="rounded-sm bg-ai/70"
                    style={{ height: `${v * 1.4}px`, opacity: 0.5 + i / 50 }}
                    aria-hidden
                  />
                  <div
                    className="rounded-sm bg-operator/70"
                    style={{ height: `${v / 1.7 + 4}px`, opacity: 0.6 }}
                    aria-hidden
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-ai/70" /> AI replies
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-operator/70" /> Operator replies
              </div>
              <span className="ml-auto text-muted-foreground">
                Illustrative · backend-driven later
              </span>
            </div>
          </Card>

          <Card className="p-5 shadow-xs">
            <h3 className="font-display text-sm font-semibold">Channels</h3>
            <p className="text-xs text-muted-foreground">Tenant-owned integrations</p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { name: "WhatsApp Business", status: "Healthy", tone: "success" as const },
                { name: "Web chat widget", status: "Healthy", tone: "success" as const },
                { name: "SMS · Twilio", status: "Healthy", tone: "success" as const },
                { name: "Voice · reserved", status: "Coming soon", tone: "muted" as const },
              ].map((c) => (
                <li key={c.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        c.tone === "success" ? "bg-success" : "bg-muted-foreground/40"
                      }`}
                    />
                    {c.name}
                  </span>
                  <span
                    className={`text-xs ${
                      c.tone === "success" ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
            <Button asChild variant="ghost" size="sm" className="mt-4 -ml-2 gap-1 text-primary">
              <Link to="/app/$tenant/integrations" params={{ tenant: t.slug }}>
                Manage integrations <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>
        </section>

        {/* LV-5: Approvals vs Customer confirmations — visually distinct */}
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-warn/25 text-warn-foreground">
                  <ShieldAlert className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-semibold">Internal approvals</h3>
                  <p className="text-xs text-muted-foreground">
                    Sensitive actions awaiting an authorized human.
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
                <Link to="/app/$tenant/approvals" params={{ tenant: t.slug }}>
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="Pending" value="5" state="pending" />
              <MiniStat label="Approved · 7d" value="22" state="approved" />
              <MiniStat label="Rejected · 7d" value="6" state="rejected" />
            </div>
          </Card>

          <Card className="p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ai/12 text-ai">
                  <CircleAlert className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-semibold">Customer confirmations</h3>
                  <p className="text-xs text-muted-foreground">
                    Awaiting reply from the customer — lives on the order.
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
                <Link to="/app/$tenant/inbox" params={{ tenant: t.slug }}>
                  Inbox <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="Awaiting" value="9" state="customer_confirmation_pending" />
              <MiniStat label="Confirmed today" value="34" state="approved" />
              <MiniStat label="Declined · 7d" value="2" state="rejected" />
            </div>
          </Card>
        </section>

        {/* Today snapshot */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Orders today" value="42" delta="+6" trend="up" icon={ShoppingBag} />
          <StatCard
            label="Confirmed today"
            value="34"
            delta="81%"
            trend="up"
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label="Handoffs today"
            value="7"
            delta="-2"
            trend="down"
            icon={ArrowRightLeft}
            tone="warn"
          />
          <StatCard
            label="Approvals · all-time"
            value="184"
            icon={ShieldCheck}
            hint="audit retained by backend"
          />
        </section>

        {/* Future areas */}
        <section>
          <SectionHeader
            title="Workspace areas"
            description="Each area will fill in across upcoming phases."
          />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <PlaceholderArea
              icon={ShoppingBag}
              scope="Level B"
              title="Orders"
              notes={[
                "List, detail, available actions from backend.",
                "Confirmation and approval states are visually distinct.",
              ]}
              contract="Tenant payments use the tenant's own gateway."
            />
            <PlaceholderArea
              icon={CalendarClock}
              scope="Level B"
              title="Reservations"
              notes={["Today / upcoming / by resource. Lighter than orders for now."]}
            />
            <PlaceholderArea
              icon={Plug}
              scope="Level B"
              title="Integrations"
              notes={["Channels, POS, tenant payment gateway."]}
            />
            <PlaceholderArea
              icon={BarChart3}
              scope="Level B"
              title="Analytics"
              notes={["Outcome, response time, AI vs operator share, conversion."]}
            />
            <PlaceholderArea
              icon={ShieldAlert}
              scope="Level B"
              title="Approvals"
              notes={["Approval-required vs confirmation-required clearly separated."]}
            />
            <PlaceholderArea
              icon={Mic}
              scope="Level B"
              title="Voice channel · reserved"
              notes={["Navigation slot reserved so voice can be added without redesign."]}
            />
          </div>
        </section>
      </div>
    </>
  );
}

function MiniStat({
  label,
  value,
  state,
}: {
  label: string;
  value: string;
  state: React.ComponentProps<typeof OpStateBadge>["state"];
}) {
  return (
    <div className="rounded-md border px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <span className="font-display text-xl font-semibold tabular-nums">{value}</span>
        <OpStateBadge state={state} size="xs" />
      </div>
    </div>
  );
}

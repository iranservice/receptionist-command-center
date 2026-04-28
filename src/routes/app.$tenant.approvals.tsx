import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, StatCard, SectionHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OpStateBadge, SeverityBadge } from "@/components/state/OpStateBadge";
import { ApprovalDrawer } from "@/components/approvals/ApprovalDrawer";
import {
  APPROVAL_TYPE_LABEL,
  demoApprovals,
  type Approval,
  type ApprovalStatus,
} from "@/lib/approvals-data";
import {
  Bot,
  User,
  Settings as SystemIcon,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Hourglass,
  Search,
  Info,
  Inbox,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/$tenant/approvals")({
  component: ApprovalsPage,
});

const FILTERS: { key: "pending" | "all" | ApprovalStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "expired", label: "Expired" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

function RequesterChip({ role }: { role: Approval["requestedByRole"] }) {
  const Icon = role === "AI" ? Bot : role === "System" ? SystemIcon : User;
  const cls =
    role === "AI"
      ? "bg-ai/12 text-ai border-ai/25"
      : role === "System"
        ? "bg-muted text-muted-foreground border-border"
        : "bg-operator/20 text-operator-foreground border-operator/35";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium uppercase tracking-wider",
        cls,
      )}
    >
      <Icon className="h-3 w-3" /> {role}
    </span>
  );
}

function ApprovalsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("pending");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Approval | null>(null);
  const [open, setOpen] = useState(false);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, expired: 0, cancelled: 0, all: 0 };
    for (const a of demoApprovals) {
      c.all++;
      c[a.status]++;
    }
    return c;
  }, []);

  const list = useMemo(() => {
    return demoApprovals
      .filter((a) => (filter === "all" ? true : a.status === filter))
      .filter((a) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          a.id.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.related.customerName?.toLowerCase().includes(q) ||
          a.related.orderId?.toLowerCase().includes(q) ||
          a.related.conversationId?.toLowerCase().includes(q)
        );
      });
  }, [filter, query]);

  function openApproval(a: Approval) {
    setActive(a);
    setOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Approvals"
        description="Sensitive operations waiting on an authorized human. Distinct from customer confirmations."
        meta={
          <>
            <Badge variant="outline" className="gap-1 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-warn" />
              {counts.pending} pending
            </Badge>
            <Badge variant="outline" className="font-normal">
              Backend is source of truth
            </Badge>
          </>
        }
      />

      {/* Distinction banner — Approval vs Customer confirmation */}
      <div className="border-b bg-muted/30">
        <div className="flex flex-col gap-2 px-6 py-3 text-xs text-foreground/80 md:flex-row md:items-center md:gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-level-b/15 text-level-b">
              <ShieldAlert className="h-3.5 w-3.5" />
            </span>
            <span>
              <span className="font-semibold">Internal approval</span> — decision by an
              authorized human (admin/operator) on a sensitive operation.
            </span>
          </div>
          <span className="hidden text-muted-foreground md:inline">·</span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            <span>
              <span className="font-semibold text-foreground">Customer confirmation</span>{" "}
              lives on the order in the conversation — not here.
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* KPIs */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Pending"
            value={String(counts.pending)}
            icon={Hourglass}
            tone="warn"
            hint="awaiting review"
          />
          <StatCard
            label="Approved · 7d"
            value={String(counts.approved)}
            icon={ShieldCheck}
            tone="success"
          />
          <StatCard
            label="Rejected · 7d"
            value={String(counts.rejected)}
            icon={ShieldX}
            hint="with reason"
          />
          <StatCard
            label="Expired · 7d"
            value={String(counts.expired)}
            icon={Hourglass}
            hint="auto-resolved by SLA"
          />
        </section>

        {/* Filters + search */}
        <Card className="p-3 shadow-xs">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {FILTERS.map((f) => {
                const isActive = f.key === filter;
                const count = counts[f.key];
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
                      isActive
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground/80 hover:bg-accent",
                    )}
                  >
                    {f.label}
                    <span
                      className={cn(
                        "rounded px-1 text-[10px] tabular-nums",
                        isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative md:w-72">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search id, customer, order…"
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
        </Card>

        {/* List */}
        <SectionHeader
          title={`${list.length} ${list.length === 1 ? "item" : "items"}`}
          description="Click a row to inspect context and act."
        />

        {list.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <Card className="overflow-hidden p-0 shadow-xs">
            <ul className="divide-y">
              {list.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => openApproval(a)}
                    className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40"
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        a.severity === "critical"
                          ? "bg-destructive"
                          : a.severity === "high"
                            ? "bg-warn"
                            : a.severity === "medium"
                              ? "bg-chart-3"
                              : "bg-muted-foreground/40",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {a.id}
                        </span>
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          {APPROVAL_TYPE_LABEL[a.type]}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-sm font-medium">{a.title}</div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {a.reason}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <RequesterChip role={a.requestedByRole} />
                        <span>{a.requestedByName}</span>
                        <span>·</span>
                        <span>{a.requestedAtLabel}</span>
                        {a.related.customerName && (
                          <>
                            <span>·</span>
                            <span className="text-foreground/80">
                              {a.related.customerName}
                            </span>
                          </>
                        )}
                        {a.related.conversationId && (
                          <span className="inline-flex items-center gap-0.5 font-mono">
                            <Inbox className="h-3 w-3" /> {a.related.conversationId}
                          </span>
                        )}
                        {a.related.orderId && (
                          <span className="inline-flex items-center gap-0.5 font-mono">
                            <ShoppingBag className="h-3 w-3" /> {a.related.orderId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <OpStateBadge state={a.status} size="xs" />
                      <SeverityBadge severity={a.severity} />
                      {a.expiresInLabel && a.status === "pending" && (
                        <span className="text-[10px] text-muted-foreground">
                          {a.expiresInLabel}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <ApprovalDrawer approval={active} open={open} onOpenChange={setOpen} />
    </>
  );
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center shadow-xs">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <h3 className="font-display text-sm font-semibold">Nothing here</h3>
      <p className="max-w-sm text-xs text-muted-foreground">
        No {filter === "all" ? "" : filter} approvals match your search. New requests will
        appear here as soon as the backend raises them.
      </p>
    </Card>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  User,
  Clock,
  ChevronRight,
  Inbox as InboxIcon,
  CircleAlert,
  Filter,
  Search,
  MessageSquare,
} from "lucide-react";

export const Route = createFileRoute("/app/$tenant/inbox")({
  head: () => ({ meta: [{ title: "Inbox · Workspace" }] }),
  component: InboxPage,
});

const buckets = [
  { id: "all", label: "All open", count: 24 },
  { id: "mine", label: "Assigned to me", count: 3 },
  { id: "unassigned", label: "Unassigned", count: 7 },
  { id: "ai", label: "AI handling", count: 11 },
  { id: "waiting", label: "Waiting on customer", count: 5 },
  { id: "approval", label: "Needs approval", count: 2 },
];

const channels = [
  { id: "wa", label: "WhatsApp", count: 14 },
  { id: "web", label: "Web chat", count: 6 },
  { id: "sms", label: "SMS", count: 4 },
];

type ThreadState = "ai" | "operator" | "waiting" | "approval";
const sampleThreads: {
  id: string;
  customer: string;
  channel: string;
  preview: string;
  state: ThreadState;
  time: string;
  unread?: number;
}[] = [
  {
    id: "1",
    customer: "Marco Rossi",
    channel: "WhatsApp",
    preview: "Table for 4 tomorrow 8pm — possible by the window?",
    state: "ai",
    time: "2m",
    unread: 1,
  },
  {
    id: "2",
    customer: "Lena Foster",
    channel: "Web",
    preview: "Can I add gluten-free pasta to my order #1042?",
    state: "operator",
    time: "5m",
  },
  {
    id: "3",
    customer: "+44 7700 900123",
    channel: "SMS",
    preview: "Order confirmation needed before kitchen sends",
    state: "approval",
    time: "9m",
    unread: 2,
  },
  {
    id: "4",
    customer: "Karim Saidi",
    channel: "WhatsApp",
    preview: "Thanks, see you Friday at 7!",
    state: "waiting",
    time: "22m",
  },
  {
    id: "5",
    customer: "Aiko Tanaka",
    channel: "Web",
    preview: "Do you take dogs on the terrace?",
    state: "ai",
    time: "34m",
  },
  {
    id: "6",
    customer: "Pedro Alves",
    channel: "WhatsApp",
    preview: "Need to cancel reservation for tonight",
    state: "operator",
    time: "1h",
  },
];

function StateBadge({ state }: { state: ThreadState }) {
  const map = {
    ai: { cls: "bg-ai/15 text-ai border-ai/30", icon: Bot, label: "AI" },
    operator: {
      cls: "bg-operator/25 text-operator-foreground border-operator/40",
      icon: User,
      label: "Operator",
    },
    waiting: { cls: "bg-muted text-muted-foreground border-border", icon: Clock, label: "Waiting" },
    approval: {
      cls: "bg-warn/30 text-warn-foreground border-warn/50",
      icon: CircleAlert,
      label: "Approval",
    },
  } as const;
  const { cls, icon: Icon, label } = map[state];
  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function InboxPage() {
  return (
    <>
      <PageHeader
        title="Inbox"
        description="Primary operational area. Conversation states (AI / Operator / Waiting / Approval) are visually distinct."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Filters
            </Button>
            <Button size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> New conversation
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        {/* Buckets / channels */}
        <aside className="border-b bg-card/40 lg:border-b-0 lg:border-r">
          <div className="p-3">
            <h3 className="px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Views
            </h3>
            <ul className="mt-2 space-y-0.5">
              {buckets.map((b, i) => (
                <li key={b.id}>
                  <button
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent ${
                      i === 0 ? "bg-accent font-medium" : "text-foreground/80"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <InboxIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {b.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-5 justify-center px-1.5 font-mono text-[10px]"
                    >
                      {b.count}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="mt-5 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Channels
            </h3>
            <ul className="mt-2 space-y-0.5">
              {channels.map((c) => (
                <li key={c.id}>
                  <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      {c.label}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Thread list */}
        <section className="min-w-0 border-r-0 lg:border-r">
          <div className="sticky top-14 z-10 flex items-center gap-2 border-b bg-background/85 px-4 py-2 backdrop-blur">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search this view…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground">{sampleThreads.length} threads</span>
          </div>

          <ul className="divide-y">
            {sampleThreads.map((t, idx) => (
              <li key={t.id}>
                <button
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60 ${
                    idx === 0 ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
                    {t.customer
                      .split(" ")
                      .map((s) => s[0])
                      .filter((c) => /[A-Za-z]/.test(c))
                      .slice(0, 2)
                      .join("")}
                    {t.unread && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground ring-2 ring-background">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{t.customer}</span>
                      <span className="text-[11px] text-muted-foreground">· {t.channel}</span>
                      <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                        {t.time}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{t.preview}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <StateBadge state={t.state} />
                      <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Detail preview */}
        <aside className="hidden border-l bg-card/40 lg:block">
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-semibold">Conversation detail</h3>
            <p className="max-w-[220px] text-xs text-muted-foreground">
              Message thread, ownership, assignment, handoff, release-to-AI, and order summary will
              live here. Built in a later phase against the backend conversation contract.
            </p>
            <Card className="mt-2 w-full p-3 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Backend contract</span>
                <Badge variant="outline" className="h-4 px-1 text-[9px] font-normal">
                  Truth
                </Badge>
              </div>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>· conversation detail · operator reply</li>
                <li>· assignment / ownership · AI reply</li>
                <li>· AI handoff · release-to-AI</li>
                <li>· order from conversation · summary</li>
              </ul>
            </Card>
          </div>
        </aside>
      </div>
    </>
  );
}

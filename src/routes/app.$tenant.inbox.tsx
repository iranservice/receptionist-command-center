import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Inbox as InboxIcon,
  ChevronRight,
  MessageSquare,
  CircleAlert,
  ArrowRightLeft,
  RefreshCw,
} from "lucide-react";
import { conversations as demoConversations, type Conversation } from "@/lib/inbox-data";
import {
  StatusBadge,
  ChannelBadge,
  OwnerBadge,
} from "@/components/inbox/state-badges";
import { MessageTimeline } from "@/components/inbox/MessageTimeline";
import { ReplyComposer } from "@/components/inbox/ReplyComposer";
import { CustomerPanel } from "@/components/inbox/CustomerPanel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/$tenant/inbox")({
  head: () => ({ meta: [{ title: "Inbox · Workspace" }] }),
  component: InboxPage,
});

type ViewKey =
  | "all"
  | "mine"
  | "unassigned"
  | "ai"
  | "needs_handoff"
  | "waiting"
  | "approval"
  | "closed";

const views: { id: ViewKey; label: string; predicate: (c: Conversation) => boolean }[] = [
  { id: "all", label: "All open", predicate: (c) => c.status !== "closed" },
  { id: "mine", label: "Assigned to me", predicate: (c) => c.assignedTo?.name === "Sara M." },
  { id: "unassigned", label: "Unassigned", predicate: (c) => c.owner === "unassigned" },
  { id: "ai", label: "AI handling", predicate: (c) => c.owner === "ai" && c.status !== "closed" },
  {
    id: "needs_handoff",
    label: "Needs handoff",
    predicate: (c) => c.status === "needs_handoff",
  },
  {
    id: "waiting",
    label: "Waiting on customer",
    predicate: (c) => c.status === "waiting_customer",
  },
  {
    id: "approval",
    label: "Pending confirmation",
    predicate: (c) => c.status === "pending_confirmation",
  },
  { id: "closed", label: "Closed", predicate: (c) => c.status === "closed" },
];

function InboxPage() {
  const [activeView, setActiveView] = useState<ViewKey>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(demoConversations[0].id);
  // Loading/error states are exposed for UX completeness even though demo data is static.
  const [phase] = useState<"ready" | "loading" | "error">("ready");

  const filtered = useMemo(() => {
    const view = views.find((v) => v.id === activeView)!;
    return demoConversations
      .filter(view.predicate)
      .filter((c) =>
        query.trim()
          ? (c.customer.name + " " + c.lastMessagePreview)
              .toLowerCase()
              .includes(query.toLowerCase())
          : true,
      );
  }, [activeView, query]);

  const selected = demoConversations.find((c) => c.id === selectedId) ?? filtered[0];

  const channelCounts = useMemo(() => {
    const m: Record<string, number> = { whatsapp: 0, web: 0, sms: 0, email: 0 };
    for (const c of demoConversations) m[c.channel] = (m[c.channel] ?? 0) + 1;
    return m;
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col">
      <PageHeader
        title="Inbox"
        description="Primary operational workspace. Conversation states (AI / Operator / Handoff / Waiting / Confirmation) are visually distinct."
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

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        {/* LEFT: Views + channels + list */}
        <aside className="flex min-h-0 flex-col border-b bg-card/40 lg:border-b-0 lg:border-r">
          <div className="border-b p-3">
            <h3 className="px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Views
            </h3>
            <ul className="mt-2 space-y-0.5">
              {views.map((v) => {
                const count = demoConversations.filter(v.predicate).length;
                const active = v.id === activeView;
                return (
                  <li key={v.id}>
                    <button
                      onClick={() => setActiveView(v.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                        active ? "bg-accent font-medium text-foreground" : "text-foreground/80 hover:bg-accent/60",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <InboxIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {v.label}
                      </span>
                      <Badge
                        variant="secondary"
                        className="h-5 min-w-5 justify-center px-1.5 font-mono text-[10px]"
                      >
                        {count}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>

            <h3 className="mt-4 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Channels
            </h3>
            <ul className="mt-2 space-y-0.5">
              {(["whatsapp", "web", "sms", "email"] as const).map((ch) => (
                <li key={ch}>
                  <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent/60">
                    <span className="flex items-center gap-2">
                      <ChannelBadge channel={ch} />
                      <span className="capitalize">{ch}</span>
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {channelCounts[ch]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* List header */}
          <div className="flex items-center gap-2 border-b bg-background/85 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this view…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground tabular-nums">{filtered.length}</span>
          </div>

          {/* List body */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {phase === "loading" ? (
              <ul className="divide-y">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="px-4 py-3">
                    <div className="flex gap-3">
                      <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : phase === "error" ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <CircleAlert className="h-6 w-6 text-destructive" />
                <p className="text-sm font-medium">Couldn't load conversations</p>
                <Button variant="outline" size="sm" className="mt-1 gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <InboxIcon className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium">Nothing in this view</p>
                <p className="max-w-[200px] text-xs text-muted-foreground">
                  Try a different view, channel, or clear the search.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {filtered.map((t) => {
                  const active = t.id === selected?.id;
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => setSelectedId(t.id)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                          active
                            ? "bg-primary/5 [box-shadow:inset_3px_0_0_var(--primary)]"
                            : "hover:bg-accent/50",
                        )}
                      >
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
                          {t.customer.name
                            .split(" ")
                            .map((s) => s[0])
                            .filter((c) => /[A-Za-z]/.test(c))
                            .slice(0, 2)
                            .join("") || "?"}
                          {t.unread > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground ring-2 ring-background">
                              {t.unread}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">
                              {t.customer.name}
                            </span>
                            <ChannelBadge channel={t.channel} />
                            <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
                              {t.lastMessageAt}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-sm text-muted-foreground">
                            {t.lastMessagePreview}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <StatusBadge status={t.status} />
                            {t.status === "needs_handoff" && (
                              <span className="text-[10px] text-warn-foreground/80">
                                <ArrowRightLeft className="inline h-2.5 w-2.5" /> handoff
                              </span>
                            )}
                            <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* CENTER: Conversation workspace */}
        <section className="flex min-h-0 min-w-0 flex-col bg-background">
          {selected ? (
            <ConversationView conversation={selected} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="max-w-[280px] text-xs text-muted-foreground">
                Pick a thread on the left to view its timeline, ownership, and linked order.
              </p>
            </div>
          )}
        </section>

        {/* RIGHT: Customer + ownership + order */}
        <aside className="hidden min-h-0 overflow-y-auto border-l lg:block">
          {selected ? (
            <CustomerPanel conversation={selected} />
          ) : (
            <div className="p-6 text-xs text-muted-foreground">No conversation selected.</div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ConversationView({ conversation }: { conversation: Conversation }) {
  const ownerLabel =
    conversation.owner === "ai"
      ? "AI"
      : conversation.assignedTo?.name ?? "Operator";

  return (
    <>
      {/* Conversation header */}
      <div className="flex items-center justify-between gap-3 border-b bg-card/40 px-6 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-display text-base font-semibold">
              {conversation.customer.name}
            </h2>
            <ChannelBadge channel={conversation.channel} withLabel />
            <StatusBadge status={conversation.status} />
            <OwnerBadge owner={conversation.owner} />
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {conversation.customer.identityLabel}
            {conversation.assignedTo && (
              <>
                {" · "}assigned to{" "}
                <span className="font-medium text-foreground">
                  {conversation.assignedTo.name}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {conversation.status === "needs_handoff" && (
            <Button size="sm" className="h-8 gap-1.5 bg-warn text-warn-foreground hover:bg-warn/90">
              <ArrowRightLeft className="h-3.5 w-3.5" /> Take handoff
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8">
            Close
          </Button>
        </div>
      </div>

      {/* Handoff banner */}
      {conversation.status === "needs_handoff" && (
        <div className="border-b border-warn/40 [background:color-mix(in_oklab,var(--warn)_15%,var(--background))] px-6 py-2">
          <div className="flex items-center gap-2 text-xs">
            <CircleAlert className="h-3.5 w-3.5 text-warn-foreground" />
            <span className="font-medium text-warn-foreground">
              AI requested handoff to operator
            </span>
            <span className="text-muted-foreground">
              · backend will gate the takeover action by your role
            </span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="min-h-0 flex-1 overflow-y-auto ops-surface">
        <MessageTimeline messages={conversation.messages} />
      </div>

      {/* Composer */}
      <ReplyComposer
        replyAllowed={conversation.replyAllowed}
        reason={conversation.replyDisallowedReason}
        ownerLabel={ownerLabel}
      />
    </>
  );
}

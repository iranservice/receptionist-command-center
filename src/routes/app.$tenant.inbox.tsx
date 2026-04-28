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
  ChevronLeft,
  MessageSquare,
  CircleAlert,
  ArrowRightLeft,
  PanelRight,
  X,
} from "lucide-react";
import { conversations as demoConversations, type Conversation } from "@/lib/inbox-data";
import { StatusBadge, ChannelBadge, OwnerBadge } from "@/components/inbox/state-badges";
import { MessageTimeline } from "@/components/inbox/MessageTimeline";
import { ReplyComposer } from "@/components/inbox/ReplyComposer";
import { CustomerPanel } from "@/components/inbox/CustomerPanel";
import { EmptyState, ErrorState, SkeletonList } from "@/components/state/UIState";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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

// Mobile view modes — desktop shows all 3 panes side by side.
type MobilePane = "list" | "conversation";

function InboxPage() {
  const [activeView, setActiveView] = useState<ViewKey>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(demoConversations[0].id);
  // UX completeness: future loaders/queries will set this from backend results.
  const [phase] = useState<"ready" | "loading" | "error">("ready");
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");
  const [contextOpen, setContextOpen] = useState(false);

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

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMobilePane("conversation");
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col">
      <PageHeader
        title="Inbox"
        description="Primary operational workspace. Conversation states (AI / Operator / Handoff / Waiting / Confirmation) are visually distinct."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New conversation</span>
              <span className="sm:hidden">New</span>
            </Button>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        {/* LEFT: Views + channels + list */}
        <aside
          className={cn(
            "flex min-h-0 flex-col border-b bg-card/40 md:border-b-0 md:border-r",
            // On mobile, hide the list when viewing a conversation
            mobilePane === "conversation" ? "hidden md:flex" : "flex",
          )}
        >
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
                      aria-pressed={active}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-accent font-medium text-foreground"
                          : "text-foreground/80 hover:bg-accent/60",
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
              aria-label="Search conversations in this view"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground tabular-nums">{filtered.length}</span>
          </div>

          {/* List body */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {phase === "loading" ? (
              <SkeletonList rows={5} />
            ) : phase === "error" ? (
              <ErrorState
                size="sm"
                title="Couldn't load conversations"
                description="Backend will own retry semantics; this is a UI placeholder."
                onRetry={() => {
                  /* wired by loader later */
                }}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                size="sm"
                icon={InboxIcon}
                title="Nothing in this view"
                description="Try a different view, channel, or clear the search."
              />
            ) : (
              <ul className="divide-y">
                {filtered.map((t) => {
                  const active = t.id === selected?.id;
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => handleSelect(t.id)}
                        aria-current={active ? "true" : undefined}
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
        <section
          className={cn(
            "flex min-h-0 min-w-0 flex-col bg-background",
            mobilePane === "list" ? "hidden md:flex" : "flex",
          )}
        >
          {selected ? (
            <ConversationView
              conversation={selected}
              onBack={() => setMobilePane("list")}
              onOpenContext={() => setContextOpen(true)}
            />
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Pick a thread on the left to view its timeline, ownership, and linked order."
            />
          )}
        </section>

        {/* RIGHT: Customer + ownership + order — desktop only */}
        <aside className="hidden min-h-0 overflow-y-auto border-l xl:block">
          {selected ? (
            <CustomerPanel conversation={selected} />
          ) : (
            <EmptyState size="sm" title="No conversation selected" />
          )}
        </aside>
      </div>

      {/* Mobile / tablet context drawer */}
      <Sheet open={contextOpen} onOpenChange={setContextOpen}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto p-0 sm:max-w-md">
          <SheetTitle className="sr-only">Customer & order context</SheetTitle>
          {selected ? (
            <CustomerPanel conversation={selected} />
          ) : (
            <EmptyState size="sm" title="No conversation selected" />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ConversationView({
  conversation,
  onBack,
  onOpenContext,
}: {
  conversation: Conversation;
  onBack: () => void;
  onOpenContext: () => void;
}) {
  const ownerLabel =
    conversation.owner === "ai" ? "AI" : (conversation.assignedTo?.name ?? "Operator");

  return (
    <>
      {/* Conversation header */}
      <div className="flex items-center justify-between gap-3 border-b bg-card/40 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {/* Mobile back */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={onBack}
            aria-label="Back to inbox list"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
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
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {conversation.status === "needs_handoff" && (
            <Button size="sm" className="h-8 gap-1.5 bg-warn text-warn-foreground hover:bg-warn/90">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Take handoff</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 xl:hidden"
            onClick={onOpenContext}
            aria-label="Open customer and order context"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="hidden h-8 sm:inline-flex">
            Close
          </Button>
        </div>
      </div>

      {/* Handoff banner */}
      {conversation.status === "needs_handoff" && (
        <div className="border-b border-warn/40 [background:color-mix(in_oklab,var(--warn)_15%,var(--background))] px-4 py-2 md:px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
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

// Keep referenced to silence unused import warnings if any helpers are added later.
void X;

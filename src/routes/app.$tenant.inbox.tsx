// Phase VI-A — Inbox page wired to backend RPCs.
// Loads inbox list from get_inbox_list().
// Loads conversation detail from get_conversation_detail().
// Operator mutations wired: reply, assign, unassign, transfer, release-to-AI.
// Order mutations wired: create, confirm, cancel, request customer confirmation.
// Falls back to demo data when Supabase is not configured.

import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { conversations as demoConversations, type Conversation } from "@/lib/inbox-data";
import { StatusBadge, ChannelBadge, OwnerBadge } from "@/components/inbox/state-badges";
import { MessageTimeline } from "@/components/inbox/MessageTimeline";
import { ReplyComposer } from "@/components/inbox/ReplyComposer";
import { CustomerPanel, type OwnershipActions } from "@/components/inbox/CustomerPanel";
import {
  EmptyState,
  ErrorState,
  SkeletonList,
  LoadingState,
  DeniedState,
} from "@/components/state/UIState";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useWorkspace } from "@/lib/workspace";
import { fetchInboxList } from "@/lib/api/inbox";
import {
  fetchConversationDetail,
  isDetailError,
  type ConversationDetailResponse,
} from "@/lib/api/conversations";
import { classifyError } from "@/lib/api/client";
import { mapInboxItemToConversation, mapDetailToConversation } from "@/lib/mappers/inbox-mapper";
import {
  sendOperatorReply,
  assignConversation,
  unassignConversation,
  transferConversation,
  releaseConversationToAI,
  isActionError,
  getActionErrorMessage,
} from "@/lib/api/conversation-actions";
import {
  requestCustomerConfirmation,
  confirmOrder,
  cancelOrder,
  createOrder,
  isOrderActionError,
  getOrderErrorMessage,
  type CreateOrderInput,
} from "@/lib/api/order-actions";
import type { OrderActionHandlers } from "@/components/inbox/OrderPanel";
import { fetchBusinessMembers, type BusinessMemberRow } from "@/lib/api/members";
import { toast } from "sonner";

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
  const { isDemoMode } = useAuth();
  const { businessId } = useWorkspace();

  const [activeView, setActiveView] = useState<ViewKey>("all");
  const [query, setQuery] = useState("");
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");
  const [contextOpen, setContextOpen] = useState(false);

  // ── Backend inbox list state ─────────────────────────────
  const [backendConversations, setBackendConversations] = useState<Conversation[]>([]);
  const [listLoading, setListLoading] = useState(!isDemoMode);
  const [listError, setListError] = useState<string | null>(null);
  const [listTotal, setListTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // ── Selected conversation + detail state ─────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailConversation, setDetailConversation] = useState<Conversation | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Use demo or backend data
  const useDemo = isDemoMode || !businessId;

  // ── Load inbox list ──────────────────────────────────────
  const loadInboxList = useCallback(
    async (silent = false) => {
      if (useDemo) return;
      if (!silent) setListLoading(true);
      else setRefreshing(true);
      setListError(null);

      const result = await fetchInboxList(businessId!);
      if (result.error) {
        const cat = classifyError(result.error);
        if (cat === "access_denied") {
          setListError("ACCESS_DENIED");
        } else {
          setListError(result.error);
        }
        if (!silent) setListLoading(false);
        else setRefreshing(false);
        return;
      }

      const data = result.data;
      if (data) {
        const mapped = data.conversations.map(mapInboxItemToConversation);
        setBackendConversations(mapped);
        setListTotal(data.total);
        // Auto-select first conversation if none selected
        if (!selectedId && mapped.length > 0) {
          setSelectedId(mapped[0].id);
        }
      }
      if (!silent) setListLoading(false);
      else setRefreshing(false);
    },
    [useDemo, businessId, selectedId],
  );

  useEffect(() => {
    if (!useDemo) {
      loadInboxList();
    }
  }, [useDemo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load conversation detail ─────────────────────────────
  const loadDetail = useCallback(
    async (conversationId: string) => {
      if (useDemo) return;
      setDetailLoading(true);
      setDetailError(null);

      const result = await fetchConversationDetail(conversationId);
      if (result.error) {
        const cat = classifyError(result.error);
        setDetailError(cat === "access_denied" ? "ACCESS_DENIED" : result.error);
        setDetailLoading(false);
        return;
      }

      const data = result.data;
      if (data && isDetailError(data)) {
        if (data.error === "ACCESS_DENIED") {
          setDetailError("ACCESS_DENIED");
        } else if (data.error === "CONVERSATION_NOT_FOUND") {
          setDetailError("CONVERSATION_NOT_FOUND");
          toast.error("Conversation not found.");
        } else {
          setDetailError(data.error);
        }
        setDetailLoading(false);
        return;
      }

      if (data && !isDetailError(data)) {
        const listItem = backendConversations.find((c) => c.id === conversationId);
        const mapped = mapDetailToConversation(data as ConversationDetailResponse, listItem);
        setDetailConversation(mapped);
      }
      setDetailLoading(false);
    },
    [useDemo, backendConversations],
  );

  // Load detail when selection changes
  useEffect(() => {
    if (selectedId && !useDemo) {
      loadDetail(selectedId);
    }
  }, [selectedId, useDemo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Determine data source ────────────────────────────────
  const allConversations = useDemo ? demoConversations : backendConversations;

  // Default selectedId for demo mode
  useEffect(() => {
    if (useDemo && !selectedId && demoConversations.length > 0) {
      setSelectedId(demoConversations[0].id);
    }
  }, [useDemo, selectedId]);

  const filtered = useMemo(() => {
    const view = views.find((v) => v.id === activeView)!;
    return allConversations
      .filter(view.predicate)
      .filter((c) =>
        query.trim()
          ? (c.customer.name + " " + c.lastMessagePreview)
              .toLowerCase()
              .includes(query.toLowerCase())
          : true,
      );
  }, [activeView, query, allConversations]);

  // Resolve selected conversation for display
  const selected = useDemo
    ? (demoConversations.find((c) => c.id === selectedId) ?? filtered[0] ?? null)
    : detailConversation;

  const channelCounts = useMemo(() => {
    const m: Record<string, number> = { whatsapp: 0, web: 0, sms: 0, email: 0 };
    for (const c of allConversations) m[c.channel] = (m[c.channel] ?? 0) + 1;
    return m;
  }, [allConversations]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDetailConversation(null); // clear stale detail
    setMobilePane("conversation");
  };

  // ── Mutation state ──────────────────────────────────────────
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [operators, setOperators] = useState<BusinessMemberRow[]>([]);
  const [operatorsLoading, setOperatorsLoading] = useState(false);

  /** Refresh detail + inbox list after a successful mutation. */
  const refreshAfterAction = useCallback(async () => {
    if (selectedId && !useDemo) {
      loadDetail(selectedId);
    }
    loadInboxList(true);
  }, [selectedId, useDemo, loadDetail, loadInboxList]);

  // ── Operator reply handler ──────────────────────────────────
  const handleSendReply = useCallback(
    async (content: string): Promise<boolean> => {
      if (!selectedId || useDemo) {
        toast.info("Demo mode — reply not sent.");
        return false;
      }
      setSending(true);
      const result = await sendOperatorReply(selectedId, content);
      setSending(false);
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      if (result.data && isActionError(result.data)) {
        toast.error(getActionErrorMessage(result.data.error));
        return false;
      }
      toast.success("Reply sent.");
      refreshAfterAction();
      return true;
    },
    [selectedId, useDemo, refreshAfterAction],
  );

  // ── Take over (assign to self) ──────────────────────────────
  const handleTakeOver = useCallback(async () => {
    if (!selectedId || useDemo || !user) {
      toast.info("Demo mode — action not available.");
      return;
    }
    const result = await assignConversation(selectedId, user.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.data && isActionError(result.data)) {
      toast.error(getActionErrorMessage(result.data.error));
      return;
    }
    toast.success("Conversation assigned to you.");
    refreshAfterAction();
  }, [selectedId, useDemo, user, refreshAfterAction]);

  // ── Release to AI ───────────────────────────────────────────
  const handleReleaseToAI = useCallback(async () => {
    if (!selectedId || useDemo) {
      toast.info("Demo mode — action not available.");
      return;
    }
    const result = await releaseConversationToAI(selectedId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.data && isActionError(result.data)) {
      toast.error(getActionErrorMessage(result.data.error));
      return;
    }
    toast.success("Conversation released to AI.");
    refreshAfterAction();
  }, [selectedId, useDemo, refreshAfterAction]);

  // ── Unassign ────────────────────────────────────────────────
  const handleUnassign = useCallback(async () => {
    if (!selectedId || useDemo) {
      toast.info("Demo mode — action not available.");
      return;
    }
    const result = await unassignConversation(selectedId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.data && isActionError(result.data)) {
      toast.error(getActionErrorMessage(result.data.error));
      return;
    }
    toast.success("Conversation unassigned.");
    refreshAfterAction();
  }, [selectedId, useDemo, refreshAfterAction]);

  // ── Reassign dialog ─────────────────────────────────────────
  const openReassignDialog = useCallback(async () => {
    if (useDemo) {
      toast.info("Demo mode — action not available.");
      return;
    }
    setReassignOpen(true);
    if (businessId && operators.length === 0) {
      setOperatorsLoading(true);
      const result = await fetchBusinessMembers(businessId);
      if (result.data) {
        setOperators(
          result.data.filter(
            (m) => m.is_active && ["owner", "manager", "operator"].includes(m.role),
          ),
        );
      }
      setOperatorsLoading(false);
    }
  }, [useDemo, businessId, operators.length]);

  const handleTransfer = useCallback(
    async (toOperatorId: string, reason?: string) => {
      if (!selectedId || useDemo) return;
      const result = await transferConversation(selectedId, toOperatorId, reason);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data && isActionError(result.data)) {
        toast.error(getActionErrorMessage(result.data.error));
        return;
      }
      toast.success("Conversation reassigned.");
      setReassignOpen(false);
      refreshAfterAction();
    },
    [selectedId, useDemo, refreshAfterAction],
  );

  // Ownership actions passed to CustomerPanel
  const ownershipActions: OwnershipActions = useMemo(
    () => ({
      onTakeOver: handleTakeOver,
      onReleaseToAI: handleReleaseToAI,
      onReassign: openReassignDialog,
      onUnassign: handleUnassign,
    }),
    [handleTakeOver, handleReleaseToAI, openReassignDialog, handleUnassign],
  );

  // ── Order mutation handlers ──────────────────────────────────
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTargetOrderId, setCancelTargetOrderId] = useState<string | null>(null);

  const handleRequestConfirmation = useCallback(
    async (orderId: string) => {
      if (useDemo) {
        toast.info("Demo mode — action not available.");
        return;
      }
      const result = await requestCustomerConfirmation(orderId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data && isOrderActionError(result.data)) {
        toast.error(getOrderErrorMessage(result.data.error));
        return;
      }
      toast.success("Confirmation requested.");
      refreshAfterAction();
    },
    [useDemo, refreshAfterAction],
  );

  const handleConfirmOrder = useCallback(
    async (orderId: string) => {
      if (useDemo) {
        toast.info("Demo mode — action not available.");
        return;
      }
      const result = await confirmOrder(orderId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data && isOrderActionError(result.data)) {
        toast.error(getOrderErrorMessage(result.data.error));
        return;
      }
      toast.success("Order confirmed.");
      refreshAfterAction();
    },
    [useDemo, refreshAfterAction],
  );

  const handleCancelOrder = useCallback(
    async (orderId: string, reason?: string) => {
      if (useDemo) {
        toast.info("Demo mode — action not available.");
        return;
      }
      // Open cancel dialog to collect reason
      if (!reason) {
        setCancelTargetOrderId(orderId);
        setCancelDialogOpen(true);
        return;
      }
      const result = await cancelOrder(orderId, reason);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data && isOrderActionError(result.data)) {
        toast.error(getOrderErrorMessage(result.data.error));
        return;
      }
      toast.success("Order cancelled.");
      refreshAfterAction();
    },
    [useDemo, refreshAfterAction],
  );

  const handleCancelOrderSubmit = useCallback(
    async (reason: string) => {
      if (!cancelTargetOrderId) return;
      const result = await cancelOrder(cancelTargetOrderId, reason || undefined);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data && isOrderActionError(result.data)) {
        toast.error(getOrderErrorMessage(result.data.error));
        return;
      }
      toast.success("Order cancelled.");
      setCancelDialogOpen(false);
      setCancelTargetOrderId(null);
      refreshAfterAction();
    },
    [cancelTargetOrderId, refreshAfterAction],
  );

  const orderActionHandlers: OrderActionHandlers = useMemo(
    () => ({
      onRequestConfirmation: handleRequestConfirmation,
      onConfirmOrder: handleConfirmOrder,
      onCancelOrder: handleCancelOrder,
    }),
    [handleRequestConfirmation, handleConfirmOrder, handleCancelOrder],
  );

  // ── Create order handler ───────────────────────────────────
  const [createOrderOpen, setCreateOrderOpen] = useState(false);

  const handleOpenCreateOrder = useCallback(() => {
    if (useDemo) {
      toast.info("Demo mode — action not available.");
      return;
    }
    if (!selected?.customerId) {
      toast.error("Cannot create order: customer information is missing.");
      return;
    }
    if (!businessId) {
      toast.error("Cannot create order: workspace context is missing.");
      return;
    }
    setCreateOrderOpen(true);
  }, [useDemo, selected, businessId]);

  const handleCreateOrderSubmit = useCallback(
    async (input: CreateOrderInput) => {
      const result = await createOrder(input);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data && isOrderActionError(result.data)) {
        // Surface missing_fields if backend provides them
        const errData = result.data as unknown as Record<string, unknown>;
        const missingFields = errData.missing_fields;
        if (Array.isArray(missingFields) && missingFields.length > 0) {
          toast.error(`Missing required fields: ${missingFields.join(", ")}`);
        } else {
          toast.error(getOrderErrorMessage(result.data.error));
        }
        return;
      }
      toast.success("Order created as draft.");
      setCreateOrderOpen(false);
      refreshAfterAction();
    },
    [refreshAfterAction],
  );

  // ── Access denied ────────────────────────────────────────
  if (listError === "ACCESS_DENIED") {
    return (
      <>
        <PageHeader title="Inbox" description="Conversation workspace" />
        <div className="p-6">
          <DeniedState
            title="Access denied"
            description="You don't have permission to view this inbox. Contact a workspace admin."
          />
        </div>
      </>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col">
      <PageHeader
        title="Inbox"
        description="Primary operational workspace. Conversation states (AI / Operator / Handoff / Waiting / Confirmation) are visually distinct."
        actions={
          <>
            {!useDemo && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => loadInboxList(true)}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}
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
                const count = allConversations.filter(v.predicate).length;
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
            {listLoading ? (
              <SkeletonList rows={5} />
            ) : listError ? (
              <ErrorState
                size="sm"
                title="Couldn't load conversations"
                description={listError}
                onRetry={() => loadInboxList()}
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
                  const active = t.id === selectedId;
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
          {detailLoading && !useDemo ? (
            <div className="flex flex-1 items-center justify-center">
              <LoadingState
                title="Loading conversation…"
                description="Fetching messages from backend."
              />
            </div>
          ) : detailError === "ACCESS_DENIED" ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <DeniedState
                title="Access denied"
                description="You don't have permission to view this conversation."
              />
            </div>
          ) : detailError ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <ErrorState
                title="Failed to load conversation"
                description={detailError}
                onRetry={() => selectedId && loadDetail(selectedId)}
              />
            </div>
          ) : selected ? (
            <ConversationView
              conversation={selected}
              onBack={() => setMobilePane("list")}
              onOpenContext={() => setContextOpen(true)}
              onSendReply={handleSendReply}
              sending={sending}
              onTakeHandoff={handleTakeOver}
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
            <CustomerPanel
              conversation={selected}
              actions={ownershipActions}
              orderActionHandlers={orderActionHandlers}
              onCreateOrder={handleOpenCreateOrder}
            />
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
            <CustomerPanel
              conversation={selected}
              actions={ownershipActions}
              orderActionHandlers={orderActionHandlers}
              onCreateOrder={handleOpenCreateOrder}
            />
          ) : (
            <EmptyState size="sm" title="No conversation selected" />
          )}
        </SheetContent>
      </Sheet>

      {/* Create order dialog */}
      {selected && businessId && selected.customerId && (
        <CreateOrderDialog
          open={createOrderOpen}
          onOpenChange={setCreateOrderOpen}
          onSubmit={handleCreateOrderSubmit}
          businessId={businessId}
          customerId={selected.customerId}
          conversationId={selected.id}
        />
      )}

      {/* Cancel order dialog */}
      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) setCancelTargetOrderId(null);
        }}
        onSubmit={handleCancelOrderSubmit}
      />

      {/* Reassign dialog */}
      <ReassignDialog
        open={reassignOpen}
        onOpenChange={setReassignOpen}
        operators={operators}
        loading={operatorsLoading}
        onTransfer={handleTransfer}
      />
    </div>
  );
}

function ConversationView({
  conversation,
  onBack,
  onOpenContext,
  onSendReply,
  sending,
  onTakeHandoff,
}: {
  conversation: Conversation;
  onBack: () => void;
  onOpenContext: () => void;
  onSendReply?: (content: string) => Promise<boolean>;
  sending?: boolean;
  onTakeHandoff?: () => Promise<void>;
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
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-warn text-warn-foreground hover:bg-warn/90"
              onClick={onTakeHandoff}
            >
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
        onSendReply={onSendReply}
        sending={sending}
      />
    </>
  );
}

// ── Reassign Dialog ─────────────────────────────────────────

function ReassignDialog({
  open,
  onOpenChange,
  operators,
  loading,
  onTransfer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operators: BusinessMemberRow[];
  loading: boolean;
  onTransfer: (toOperatorId: string, reason?: string) => Promise<void>;
}) {
  const [selectedOp, setSelectedOp] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOp) return;
    setSubmitting(true);
    await onTransfer(selectedOp, reason.trim() || undefined);
    setSubmitting(false);
    setSelectedOp("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign conversation</DialogTitle>
          <DialogDescription>
            Select an operator to transfer this conversation to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reassign-operator">Operator</Label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading operators…
              </div>
            ) : operators.length === 0 ? (
              <p className="text-sm text-muted-foreground">No operators available.</p>
            ) : (
              <select
                id="reassign-operator"
                value={selectedOp}
                onChange={(e) => setSelectedOp(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select operator…</option>
                {operators.map((op) => (
                  <option key={op.user_id} value={op.user_id}>
                    {op.display_name ?? op.email ?? op.user_id} ({op.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reassign-reason">Reason (optional)</Label>
            <Input
              id="reassign-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Specializes in this customer"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedOp || submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Transferring…
              </>
            ) : (
              "Transfer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Cancel Order Dialog ─────────────────────────────────────

function CancelOrderDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(reason.trim());
    setSubmitting(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action is recorded in the audit log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer changed their mind"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep order
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Cancelling…
              </>
            ) : (
              "Cancel order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Create Order Dialog ─────────────────────────────────────

type OrderItemDraft = {
  item_name: string;
  quantity: number;
  unit_price: string; // Keep as string for safe input handling
  notes: string;
};

const emptyItem = (): OrderItemDraft => ({
  item_name: "",
  quantity: 1,
  unit_price: "",
  notes: "",
});

function CreateOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  businessId,
  customerId,
  conversationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateOrderInput) => Promise<void>;
  businessId: string;
  customerId: string;
  conversationId: string;
}) {
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway" | "delivery">("dine_in");
  const [items, setItems] = useState<OrderItemDraft[]>([emptyItem()]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateItem = (index: number, field: keyof OrderItemDraft, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setOrderType("dine_in");
    setItems([emptyItem()]);
    setDeliveryAddress("");
    setNotes("");
  };

  const isValid =
    items.length > 0 &&
    items.every((item) => item.item_name.trim() !== "" && item.quantity > 0) &&
    (orderType !== "delivery" || deliveryAddress.trim() !== "");

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        businessId,
        customerId,
        conversationId,
        orderType,
        items: items.map((item) => ({
          item_name: item.item_name.trim(),
          quantity: item.quantity,
          unit_price: item.unit_price ? parseFloat(item.unit_price) || null : null,
          notes: item.notes.trim() || undefined,
        })),
        deliveryAddress: orderType === "delivery" ? deliveryAddress.trim() : null,
        notes: notes.trim() || null,
      });
      // Form resets via onOpenChange when dialog closes after success
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create order</DialogTitle>
          <DialogDescription>
            Create a draft order for this conversation. The order will be saved as a draft for
            review before confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Order type */}
          <div className="space-y-2">
            <Label htmlFor="order-type">Order type</Label>
            <select
              id="order-type"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as "dine_in" | "takeaway" | "delivery")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="dine_in">Dine-in</option>
              <option value="takeaway">Pickup / Takeaway</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          {/* Delivery address — only for delivery */}
          {orderType === "delivery" && (
            <div className="space-y-2">
              <Label htmlFor="delivery-address">
                Delivery address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="delivery-address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g. 123 Main St, Apt 4B"
              />
            </div>
          )}

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Items <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                onClick={addItem}
              >
                <Plus className="h-3 w-3" /> Add item
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="rounded-md border bg-muted/30 p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Input
                        value={item.item_name}
                        onChange={(e) => updateItem(idx, "item_name", e.target.value)}
                        placeholder="Item name *"
                        className="h-8 text-sm"
                      />
                      <div className="flex gap-2">
                        <div className="w-20">
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "quantity",
                                Math.max(1, parseInt(e.target.value) || 1),
                              )
                            }
                            placeholder="Qty"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="w-28">
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={item.unit_price}
                            onChange={(e) => updateItem(idx, "unit_price", e.target.value)}
                            placeholder="Unit price"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Input
                            value={item.notes}
                            onChange={(e) => updateItem(idx, "notes", e.target.value)}
                            placeholder="Notes"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order notes */}
          <div className="space-y-2">
            <Label htmlFor="order-notes">Order notes (optional)</Label>
            <Textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. No onions, extra sauce"
              rows={2}
            />
          </div>

          <p className="text-[10px] text-muted-foreground">
            Order will be created as <span className="font-medium">draft</span>. Use order actions
            to send confirmation or finalize.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Creating…
              </>
            ) : (
              "Create draft order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

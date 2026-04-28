import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  ExternalLink,
  Send,
  CheckCircle2,
  XCircle,
  Pencil,
  Clock,
  AlertCircle,
  Lock,
  MessageSquare,
  MapPin,
  CalendarClock,
  Info,
  CircleDashed,
  RefreshCw,
} from "lucide-react";
import type { LinkedOrder, OrderAction, OrderStatus, CustomerConfirmation } from "@/lib/inbox-data";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Order status badge
// ---------------------------------------------------------------------------

const orderStatusMap: Record<
  OrderStatus,
  { label: string; cls: string; icon: typeof Clock; tone: "neutral" | "warn" | "success" | "muted" }
> = {
  draft: {
    label: "Draft",
    cls: "bg-muted text-muted-foreground border-border",
    icon: CircleDashed,
    tone: "neutral",
  },
  pending_customer_confirmation: {
    label: "Pending customer confirmation",
    cls: "bg-warn/25 text-warn-foreground border-warn/50",
    icon: Clock,
    tone: "warn",
  },
  confirmed: {
    label: "Confirmed",
    cls: "bg-success/15 text-success border-success/30",
    icon: CheckCircle2,
    tone: "success",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-destructive/12 text-destructive border-destructive/30",
    icon: XCircle,
    tone: "muted",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, cls, icon: Icon } = orderStatusMap[status];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium uppercase tracking-wider",
        cls,
      )}
    >
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Customer confirmation badge — visually distinct from "approval"
// ---------------------------------------------------------------------------

const confirmationMap: Record<
  CustomerConfirmation["status"],
  { label: string; cls: string; icon: typeof Clock }
> = {
  not_required: {
    label: "Confirmation not required",
    cls: "text-muted-foreground border-border bg-muted/40",
    icon: Info,
  },
  not_requested: {
    label: "Not yet requested from customer",
    cls: "text-muted-foreground border-border bg-muted/40",
    icon: CircleDashed,
  },
  requested: {
    label: "Awaiting customer reply",
    cls: "text-warn-foreground border-warn/50 bg-warn/20",
    icon: Clock,
  },
  received: {
    label: "Confirmed by customer",
    cls: "text-success border-success/30 bg-success/12",
    icon: CheckCircle2,
  },
  declined: {
    label: "Customer declined",
    cls: "text-destructive border-destructive/30 bg-destructive/10",
    icon: XCircle,
  },
  expired: {
    label: "Confirmation expired",
    cls: "text-muted-foreground border-border bg-muted/40",
    icon: AlertCircle,
  },
};

function ConfirmationPill({ status }: { status: CustomerConfirmation["status"] }) {
  const { label, cls, icon: Icon } = confirmationMap[status];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium",
        cls,
      )}
    >
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Action button registry
// ---------------------------------------------------------------------------

type ActionDescriptor = {
  label: string;
  icon: typeof Send;
  variant?: "default" | "outline" | "ghost" | "destructive";
  emphasis?: "primary" | "secondary";
};

const actionRegistry: Record<OrderAction, ActionDescriptor> = {
  view_order: { label: "View order", icon: ExternalLink, variant: "outline" },
  request_customer_confirmation: {
    label: "Request customer confirmation",
    icon: Send,
    variant: "default",
    emphasis: "primary",
  },
  confirm_order: {
    label: "Confirm order",
    icon: CheckCircle2,
    variant: "default",
    emphasis: "primary",
  },
  cancel_order: { label: "Cancel order", icon: XCircle, variant: "ghost" },
  edit_order: { label: "Edit order", icon: Pencil, variant: "outline" },
};

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

export function OrderPanelEmpty() {
  return (
    <div className="px-4 py-5">
      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center">
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="h-4 w-4" />
        </div>
        <p className="text-sm font-medium">No order linked</p>
        <p className="mx-auto mt-1 max-w-[240px] text-xs text-muted-foreground">
          When this conversation creates an order or reservation, it will appear here.
        </p>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Order creation is performed by the backend (AI workflow or operator action).
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multi-order tabs (lightweight)
// ---------------------------------------------------------------------------

function OrderTabs({
  orders,
  selectedId,
  onSelect,
}: {
  orders: LinkedOrder[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (orders.length <= 1) return null;
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b bg-card/40 px-3 py-1.5">
      {orders.map((o) => {
        const active = o.id === selectedId;
        const tone = orderStatusMap[o.status].tone;
        return (
          <button
            key={o.id}
            onClick={() => onSelect(o.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-colors whitespace-nowrap",
              active
                ? "border-primary/40 bg-primary/8 text-foreground font-medium"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <ShoppingBag className="h-3 w-3" />
            <span className="font-mono tabular-nums">{o.orderNumber}</span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                tone === "warn" && "bg-warn",
                tone === "success" && "bg-success",
                tone === "muted" && "bg-destructive/60",
                tone === "neutral" && "bg-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function OrderPanel({ orders }: { orders: LinkedOrder[] | undefined }) {
  const list = orders ?? [];
  const [selectedId, setSelectedId] = useState<string>(list[0]?.id ?? "");
  const order = list.find((o) => o.id === selectedId) ?? list[0];

  if (!order) {
    return (
      <div>
        <SectionHeader title="Linked order" />
        <OrderPanelEmpty />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Linked order"
        right={
          <span className="text-[10px] text-muted-foreground">
            {list.length > 1 ? `${list.length} orders` : "1 order"}
          </span>
        }
      />
      <OrderTabs orders={list} selectedId={order.id} onSelect={setSelectedId} />
      <OrderCard order={order} />
    </div>
  );
}

function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t px-4 pt-3.5 pb-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h3>
      {right}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-order content
// ---------------------------------------------------------------------------

function OrderCard({ order }: { order: LinkedOrder }) {
  const isCancelled = order.status === "cancelled";
  const isConfirmed = order.status === "confirmed";
  const isPending = order.status === "pending_customer_confirmation";

  // Status-tinted left rail to make state scannable at a glance.
  const railTone = isPending
    ? "before:bg-warn"
    : isConfirmed
      ? "before:bg-success"
      : isCancelled
        ? "before:bg-destructive/60"
        : "before:bg-muted-foreground/30";

  return (
    <div className="px-4 pb-4">
      <Card
        className={cn(
          "relative overflow-hidden p-3.5 shadow-xs",
          "before:absolute before:inset-y-0 before:left-0 before:w-[3px]",
          railTone,
          isCancelled && "opacity-90",
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-sm font-semibold tabular-nums">
                {order.orderNumber}
              </span>
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium capitalize">
                {order.channel.replace("_", " ")}
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {order.businessTypeLabel ?? "Order"} · created {order.createdAtLabel}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Customer confirmation strip — visually distinct from approval */}
        <ConfirmationStrip order={order} />

        {/* Snapshot */}
        {order.snapshot && <SnapshotBlock snapshot={order.snapshot} />}

        {/* Items */}
        <ItemsList items={order.items} />

        {/* Totals */}
        {(order.subtotalLabel || order.totalLabel !== "—") && (
          <div className="mt-2.5 space-y-0.5 border-t pt-2 text-xs">
            {order.subtotalLabel && <Row label="Subtotal" value={order.subtotalLabel} muted />}
            {order.taxLabel && <Row label="Tax" value={order.taxLabel} muted />}
            <Row label="Total" value={order.totalLabel} strong className="pt-0.5 text-sm" />
          </div>
        )}

        {/* Suggested confirmation message preview */}
        {(isPending || order.status === "draft") &&
          order.customerConfirmation.suggestedMessagePreview && (
            <SuggestedMessage
              text={order.customerConfirmation.suggestedMessagePreview}
              channelLabel={order.customerConfirmation.channelLabel}
              variant={isPending ? "resend" : "request"}
            />
          )}

        {/* Actions */}
        <ActionsRow order={order} />

        {/* Source-of-truth note */}
        <p className="mt-2 flex items-start gap-1 text-[10px] text-muted-foreground">
          <Lock className="mt-px h-2.5 w-2.5" />
          Available actions, pricing, and confirmation state are provided by the backend per order
          state and operator role. Frontend is display-only.
        </p>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ConfirmationStrip({ order }: { order: LinkedOrder }) {
  const c = order.customerConfirmation;
  return (
    <div
      className={cn(
        "mt-2.5 rounded-md border px-2.5 py-2",
        c.status === "requested" && "border-warn/40 bg-warn/10",
        c.status === "received" && "border-success/30 bg-success/8",
        c.status === "declined" && "border-destructive/30 bg-destructive/8",
        (c.status === "not_required" || c.status === "not_requested" || c.status === "expired") &&
          "border-border bg-muted/30",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Customer confirmation
        </span>
        <ConfirmationPill status={c.status} />
      </div>
      {c.lastUpdatedLabel && (
        <p className="mt-1 text-[11px] text-muted-foreground">{c.lastUpdatedLabel}</p>
      )}
      {c.status === "requested" && (
        <p className="mt-1 text-[10px] text-muted-foreground">
          Final confirmation must come from the customer or an authorized backend flow — operators
          do not confirm on their behalf.
        </p>
      )}
    </div>
  );
}

function SnapshotBlock({ snapshot }: { snapshot: NonNullable<LinkedOrder["snapshot"]> }) {
  return (
    <div className="mt-2.5 rounded-md border bg-background/60 px-2.5 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Snapshot
        </span>
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium">
          {snapshot.fulfilmentLabel}
        </Badge>
      </div>
      <ul className="mt-1.5 space-y-1 text-xs">
        {snapshot.scheduledForLabel && (
          <li className="flex items-start gap-1.5">
            <CalendarClock className="mt-0.5 h-3 w-3 text-muted-foreground" />
            <span>{snapshot.scheduledForLabel}</span>
          </li>
        )}
        {snapshot.locationLabel && (
          <li className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />
            <span>{snapshot.locationLabel}</span>
          </li>
        )}
        {snapshot.details?.map((d, i) => (
          <li key={i} className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground">{d.label}</span>
            <span className="text-foreground">{d.value}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-[10px] text-muted-foreground italic">
        Snapshot is captured by the backend at order creation.
      </p>
    </div>
  );
}

function ItemsList({ items }: { items: LinkedOrder["items"] }) {
  return (
    <ul className="mt-2.5 space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono tabular-nums text-muted-foreground">{it.qty}×</span>
                <span className="font-medium text-foreground">{it.name}</span>
              </div>
              {it.modifiers && it.modifiers.length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-1 pl-5">
                  {it.modifiers.map((m, j) => (
                    <span
                      key={j}
                      className="inline-flex h-4 items-center rounded bg-muted px-1.5 text-[10px] text-muted-foreground"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
              {it.note && (
                <p className="mt-0.5 pl-5 text-[10px] italic text-muted-foreground">
                  Note: {it.note}
                </p>
              )}
            </div>
            {it.lineTotalLabel && (
              <span className="shrink-0 font-mono text-xs tabular-nums text-foreground/80">
                {it.lineTotalLabel}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
  className,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className={cn(muted && "text-muted-foreground")}>{label}</span>
      <span
        className={cn(
          "font-mono tabular-nums",
          strong && "font-semibold text-foreground",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SuggestedMessage({
  text,
  channelLabel,
  variant,
}: {
  text: string;
  channelLabel?: string;
  variant: "request" | "resend";
}) {
  return (
    <div className="mt-2.5 rounded-md border border-dashed bg-muted/30 px-2.5 py-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          {variant === "request" ? "Confirmation message preview" : "Resend preview"}
        </span>
        {channelLabel && (
          <span className="text-[10px] text-muted-foreground">via {channelLabel}</span>
        )}
      </div>
      <p className="text-xs italic text-foreground/85">"{text}"</p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Backend formats and sends the actual message — preview shown for operator awareness only.
      </p>
    </div>
  );
}

function ActionsRow({ order }: { order: LinkedOrder }) {
  const actions = order.availableActions;
  // Order actions in a sensible visual priority
  const priority: OrderAction[] = [
    "request_customer_confirmation",
    "confirm_order",
    "edit_order",
    "view_order",
    "cancel_order",
  ];
  const sorted = priority.filter((a) => actions.includes(a));

  // Common "expected" actions per state, used to surface why something is missing.
  const expected: OrderAction[] =
    order.status === "draft"
      ? ["request_customer_confirmation", "edit_order", "cancel_order", "view_order"]
      : order.status === "pending_customer_confirmation"
        ? ["request_customer_confirmation", "cancel_order", "view_order"]
        : order.status === "confirmed"
          ? ["view_order", "cancel_order"]
          : ["view_order"];

  const missing = expected.filter((a) => !actions.includes(a));

  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Available actions
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <Lock className="h-2.5 w-2.5" /> backend-controlled
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sorted.length === 0 && (
          <span className="text-[11px] italic text-muted-foreground">
            No actions available for current state.
          </span>
        )}
        {sorted.map((a) => {
          const d = actionRegistry[a];
          const Icon = d.icon;
          const isResend =
            a === "request_customer_confirmation" &&
            order.status === "pending_customer_confirmation";
          const label = isResend ? "Resend confirmation" : d.label;
          const isDestructive = a === "cancel_order";
          return (
            <Button
              key={a}
              variant={d.variant ?? "outline"}
              size="sm"
              className={cn(
                "h-7 gap-1 text-xs",
                isDestructive && "text-destructive hover:text-destructive",
                isResend && "gap-1.5",
              )}
            >
              {isResend ? <RefreshCw className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
              {label}
            </Button>
          );
        })}
      </div>

      {missing.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {missing.map((a) => {
            const d = actionRegistry[a];
            const note = order.unavailableActionNotes?.[a];
            return (
              <li key={a} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <Lock className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                <span>
                  <span className="font-medium">{d.label}</span> not available
                  {note ? <> — {note}</> : <> for current state.</>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

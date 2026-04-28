import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  User,
  ArrowRightLeft,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Languages,
  Clock,
  StickyNote,
  Tag,
  ExternalLink,
} from "lucide-react";
import type { Conversation } from "@/lib/inbox-data";
import { OwnerBadge } from "./state-badges";

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3.5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function CustomerPanel({ conversation }: { conversation: Conversation }) {
  const c = conversation.customer;
  const o = conversation.order;

  return (
    <div className="flex h-full flex-col divide-y bg-card/40">
      {/* Customer header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {c.name
              .split(" ")
              .map((s) => s[0])
              .filter((x) => /[A-Za-z]/.test(x))
              .slice(0, 2)
              .join("") || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">{c.name}</p>
            <p className="truncate text-xs text-muted-foreground">{c.identityLabel}</p>
          </div>
        </div>
        {c.tags && c.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {c.tags.map((t) => (
              <Badge key={t} variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                <Tag className="mr-1 h-2.5 w-2.5" />
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Ownership */}
      <Section title="Conversation ownership" action={<OwnerBadge owner={conversation.owner} />}>
        <div className="space-y-2 text-xs">
          {conversation.assignedTo ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assigned to</span>
              <span className="font-medium">
                {conversation.assignedTo.name}
                {conversation.assignedTo.team && (
                  <span className="text-muted-foreground"> · {conversation.assignedTo.team}</span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assigned to</span>
              <span className="text-muted-foreground">—</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <User className="h-3 w-3" /> Take over
            </Button>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <Bot className="h-3 w-3" /> Release to AI
            </Button>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <ArrowRightLeft className="h-3 w-3" /> Reassign
            </Button>
          </div>
          <p className="pt-1 text-[10px] text-muted-foreground">
            Actions are mirrored from backend; final permission is enforced server-side.
          </p>
        </div>
      </Section>

      {/* Customer context */}
      <Section title="Customer context">
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <Phone className="mt-0.5 h-3 w-3 text-muted-foreground" />
            <span className="text-foreground">{c.identityLabel}</span>
          </li>
          {c.language && (
            <li className="flex items-start gap-2">
              <Languages className="mt-0.5 h-3 w-3 text-muted-foreground" />
              <span>
                Preferred language: <span className="font-medium">{c.language}</span>
              </span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />
            <span className={c.addressLabel ? "" : "text-muted-foreground italic"}>
              {c.addressLabel ?? "No saved address"}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {c.previousInteractionsLabel ?? "No prior interactions"}
            </span>
          </li>
        </ul>
      </Section>

      {/* Linked order */}
      <Section
        title="Linked order"
        action={
          o ? (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium">
              #{o.id}
            </Badge>
          ) : null
        }
      >
        {o ? (
          <Card className="p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                {o.channel.replace("_", " ")}
              </span>
              <OrderStatusBadge status={o.status} />
            </div>
            <ul className="mt-2 space-y-0.5 text-xs">
              {o.items.map((it, i) => (
                <li key={i} className="flex justify-between text-foreground/85">
                  <span>
                    <span className="font-mono tabular-nums text-muted-foreground">{it.qty}×</span>{" "}
                    {it.name}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t pt-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Total
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums">{o.totalLabel}</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {o.availableActions.includes("view") && (
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                  <ExternalLink className="h-3 w-3" /> View order
                </Button>
              )}
              {o.availableActions.includes("request_confirmation") && (
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Request confirmation
                </Button>
              )}
              {o.availableActions.includes("confirm") && (
                <Button size="sm" className="h-7 text-xs">
                  Confirm
                </Button>
              )}
              {o.availableActions.includes("cancel") && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">
                  Cancel
                </Button>
              )}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Available actions are decided by the backend per order state.
            </p>
          </Card>
        ) : (
          <p className="text-xs italic text-muted-foreground">
            No order linked to this conversation.
          </p>
        )}
      </Section>

      {/* Tags & notes */}
      <Section
        title="Tags & internal notes"
        action={
          <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-[11px]">
            <StickyNote className="h-3 w-3" /> Add note
          </Button>
        }
      >
        <div className="flex flex-wrap gap-1">
          {(conversation.tags ?? []).map((t) => (
            <Badge key={t} variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
              {t}
            </Badge>
          ))}
          {(!conversation.tags || conversation.tags.length === 0) && (
            <span className="text-xs italic text-muted-foreground">No tags yet</span>
          )}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {conversation.noteCount ?? 0} internal note
          {(conversation.noteCount ?? 0) === 1 ? "" : "s"}. Notes are operator-only and never sent
          to the customer.
        </p>
      </Section>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: NonNullable<Conversation["order"]>["status"] }) {
  const map = {
    draft: { cls: "bg-muted text-muted-foreground border-border", label: "Draft" },
    pending_confirmation: {
      cls: "bg-warn/30 text-warn-foreground border-warn/40",
      label: "Pending confirm",
    },
    confirmed: { cls: "bg-success/15 text-success border-success/25", label: "Confirmed" },
    cancelled: {
      cls: "bg-destructive/12 text-destructive border-destructive/30",
      label: "Cancelled",
    },
  } as const;
  const { cls, label } = map[status];
  return (
    <span
      className={`inline-flex h-5 items-center rounded-md border px-1.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}
    >
      {label}
    </span>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  User,
  ArrowRightLeft,
  Phone,
  MapPin,
  Languages,
  Clock,
  StickyNote,
  Tag,
} from "lucide-react";
import type { Conversation } from "@/lib/inbox-data";
import { OwnerBadge } from "./state-badges";
import { OrderPanel } from "./OrderPanel";

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
  // Prefer the multi-order list if present, fall back to the single linked order.
  const orders = conversation.orders ?? (conversation.order ? [conversation.order] : []);

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

      {/* Linked order — LV-4 enhanced panel */}
      <OrderPanel orders={orders} />

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

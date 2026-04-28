import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useParams } from "@tanstack/react-router";
import { OpStateBadge, SeverityBadge } from "@/components/state/OpStateBadge";
import {
  APPROVAL_TYPE_LABEL,
  type Approval,
  type ApprovalAction,
} from "@/lib/approvals-data";
import {
  Bot,
  User,
  Settings as SystemIcon,
  ShieldCheck,
  ShieldX,
  ExternalLink,
  Inbox,
  ShoppingBag,
  ArrowRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_META: Record<
  ApprovalAction,
  { label: string; icon: typeof ShieldCheck; variant: "default" | "destructive" | "outline" }
> = {
  approve: { label: "Approve", icon: ShieldCheck, variant: "default" },
  reject: { label: "Reject", icon: ShieldX, variant: "destructive" },
  view_context: { label: "View context", icon: ExternalLink, variant: "outline" },
};

function RequesterIcon({ role }: { role: Approval["requestedByRole"] }) {
  const Icon = role === "AI" ? Bot : role === "System" ? SystemIcon : User;
  const cls =
    role === "AI"
      ? "bg-ai/12 text-ai"
      : role === "System"
        ? "bg-muted text-muted-foreground"
        : "bg-operator/20 text-operator-foreground";
  return (
    <span className={cn("flex h-7 w-7 items-center justify-center rounded-md", cls)}>
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

export function ApprovalDrawer({
  approval,
  open,
  onOpenChange,
}: {
  approval: Approval | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { tenant } = useParams({ strict: false }) as { tenant?: string };
  if (!approval) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[520px]"
      >
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-start gap-3">
            <RequesterIcon role={approval.requestedByRole} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {approval.id}
                </span>
                <span className="text-[11px] text-muted-foreground">·</span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {APPROVAL_TYPE_LABEL[approval.type]}
                </span>
              </div>
              <SheetTitle className="mt-1 text-left font-display text-base font-semibold leading-tight">
                {approval.title}
              </SheetTitle>
              <SheetDescription className="mt-1 text-left text-sm">
                {approval.reason}
              </SheetDescription>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <OpStateBadge state={approval.status} size="xs" />
                <SeverityBadge severity={approval.severity} />
                {approval.expiresInLabel && approval.status === "pending" && (
                  <span className="text-[11px] text-muted-foreground">
                    {approval.expiresInLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Internal-approval banner — distinguish from customer confirmation */}
          <div className="mx-5 mt-4 flex items-start gap-2 rounded-md border border-level-b/30 bg-level-b/10 px-3 py-2 text-xs text-foreground/85">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-level-b" />
            <span>
              <span className="font-semibold">Internal approval</span> — decision by an
              authorized human. This is <span className="font-semibold">not</span> the
              customer-confirmation flow.
            </span>
          </div>

          {/* Requester */}
          <section className="px-5 py-4">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Requested by
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <RequesterIcon role={approval.requestedByRole} />
              <div className="leading-tight">
                <div className="font-medium">{approval.requestedByName}</div>
                <div className="text-xs text-muted-foreground">
                  {approval.requestedByRole} · {approval.requestedAtLabel}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Related */}
          {(approval.related.conversationId || approval.related.orderId) && (
            <>
              <section className="px-5 py-4">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Related
                </h4>
                <ul className="space-y-2 text-sm">
                  {approval.related.customerName && (
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium">{approval.related.customerName}</span>
                    </li>
                  )}
                  {approval.related.conversationId && (
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Conversation</span>
                      <Link
                        to="/app/$tenant/inbox"
                        params={{ tenant: tenant ?? "bella-trattoria" }}
                        className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                      >
                        <Inbox className="h-3 w-3" />
                        {approval.related.conversationId}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  )}
                  {approval.related.orderId && (
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Order</span>
                      <span className="inline-flex items-center gap-1 font-mono text-xs">
                        <ShoppingBag className="h-3 w-3" />
                        {approval.related.orderId}
                      </span>
                    </li>
                  )}
                </ul>
              </section>
              <Separator />
            </>
          )}

          {/* Context */}
          {approval.context && approval.context.length > 0 && (
            <>
              <section className="px-5 py-4">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Context
                </h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {approval.context.map((c) => (
                    <div key={c.label} className="flex flex-col">
                      <dt className="text-xs text-muted-foreground">{c.label}</dt>
                      <dd className="font-medium tabular-nums">{c.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <Separator />
            </>
          )}

          {/* Resolution */}
          {approval.resolution && (
            <>
              <section className="px-5 py-4">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Resolution
                </h4>
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{approval.resolution.by}</span>
                    <span className="text-xs text-muted-foreground">
                      {approval.resolution.atLabel}
                    </span>
                  </div>
                  {approval.resolution.note && (
                    <p className="mt-1 text-sm text-foreground/80">
                      {approval.resolution.note}
                    </p>
                  )}
                </div>
              </section>
              <Separator />
            </>
          )}

          {/* Audit */}
          <section className="px-5 py-4">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Audit trail
            </h4>
            {approval.audit && approval.audit.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {approval.audit.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{a.actor}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {a.at}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{a.event}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Backend will surface the full audit trail here.
              </p>
            )}
          </section>
        </div>

        {/* Backend-driven action bar */}
        <div className="border-t bg-card/60 p-4">
          <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            Available actions <span className="text-foreground/60">· backend-controlled</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {approval.availableActions.map((a) => {
              const meta = ACTION_META[a];
              const Icon = meta.icon;
              return (
                <Button
                  key={a}
                  size="sm"
                  variant={meta.variant}
                  className="gap-1.5"
                  // No real backend wired — placeholder action.
                  onClick={() => {
                    /* placeholder */
                  }}
                  disabled={approval.status !== "pending" && a !== "view_context"}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                </Button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

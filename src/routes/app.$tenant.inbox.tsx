import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, User, Clock, ChevronRight, Inbox as InboxIcon, CircleAlert } from "lucide-react";

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

const sampleThreads = [
  { id: "1", customer: "Marco R.", channel: "WhatsApp", preview: "Table for 4 tomorrow 8pm…", state: "ai", time: "2m" },
  { id: "2", customer: "Lena F.", channel: "Web", preview: "Can I add gluten-free pasta?", state: "operator", time: "5m" },
  { id: "3", customer: "+44 7700 900123", channel: "SMS", preview: "Order confirmation needed", state: "approval", time: "9m" },
  { id: "4", customer: "Karim S.", channel: "WhatsApp", preview: "Thanks, see you Friday!", state: "waiting", time: "22m" },
];

function StateBadge({ state }: { state: string }) {
  if (state === "ai") return <Badge className="gap-1 bg-ai text-ai-foreground hover:bg-ai"><Bot className="h-3 w-3" />AI</Badge>;
  if (state === "operator") return <Badge className="gap-1 bg-operator text-operator-foreground hover:bg-operator"><User className="h-3 w-3" />Operator</Badge>;
  if (state === "waiting") return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Waiting</Badge>;
  if (state === "approval") return <Badge className="gap-1 bg-warn text-warn-foreground hover:bg-warn"><CircleAlert className="h-3 w-3" />Approval</Badge>;
  return <Badge variant="outline">{state}</Badge>;
}

function InboxPage() {
  return (
    <>
      <PageHeader
        title="Inbox"
        description="The primary operational workspace. AI-active and operator-active states are visually distinct."
        actions={<Button size="sm" variant="outline">Filters</Button>}
      />
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[260px_1fr]">
        {/* Buckets */}
        <aside className="border-b lg:border-b-0 lg:border-r">
          <div className="px-3 py-3">
            <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Views</h2>
            <ul className="mt-2 space-y-0.5">
              {buckets.map((b, i) => (
                <li key={b.id}>
                  <button className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent ${i === 0 ? "bg-accent font-medium" : ""}`}>
                    <span className="flex items-center gap-2">
                      <InboxIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {b.label}
                    </span>
                    <Badge variant="secondary" className="font-normal">{b.count}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Thread list */}
        <section>
          <ul className="divide-y">
            {sampleThreads.map((t) => (
              <li key={t.id}>
                <button className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-accent/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {t.customer.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{t.customer}</span>
                      <span className="text-xs text-muted-foreground">· {t.channel}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{t.time}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{t.preview}</p>
                  </div>
                  <StateBadge state={t.state} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>

          <Card className="m-5 border-dashed p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Inbox detail and reply composer arrive in a later phase.</p>
            <p className="mt-1">
              This phase only establishes IA and primary placement. State badges (AI / Operator / Waiting / Approval),
              ownership, assignment, handoff, and release-to-AI come from backend conversation detail.
            </p>
          </Card>
        </section>
      </div>
    </>
  );
}
